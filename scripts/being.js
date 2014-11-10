Being = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    // graphics
    this.span = document.createElement('div')
    this.innerSpan = document.createElement('div')
    this.span.className = 'being blood'
    this.span.textContent = this.symbol
    this.innerSpan.className = this.className + ' being_fg'
    this.innerSpan.textContent = this.symbol
    this.span.appendChild(this.innerSpan)

    if (this.square)
        this.square.enter(this)
    this.viewports = []
    this.controllers = []

    // highly mutable attributes
    this.inventory = new InventoryPlane(this.inventory)
    for (var x = 0; x < this.inventory.width; x++) {
        for (var y = 0; y < this.inventory.height; y++) {
            this.inventory.square(new Coordinate({x: x, y: y})).reveal(this, 1)
        }
    }
    this.dead = 0
    this.health = 1
    this.body_fat = this.lean_mass * .3
    this.wielding = false
    this.hibernating = false
    this.experience = 0
    universe.timeline.add_agent(this)
})

Being.set_name = 'clades'

Being.prototype = Object.create(WorldObject.prototype)

Being.prototype.name = 'being'
Being.prototype.power = 10
Being.prototype.speed = 10
Being.prototype.vigor = 10

Being.prototype.inventory = {width: 1, height: 1}
Being.prototype.can_walk = true
Being.prototype.can_swim = false
Being.prototype.can_fly = false
Being.prototype.playable = false
Being.prototype.habitat = {}

// methods
Being.prototype.notify = function() {
    this.viewports.forEach(function(viewport) {viewport.render()})
}

Being.prototype.act = function(callback) {
    this.notify()
    this.hibernating = this.should_hibernate()
    if (this.hibernating)
        return callback()
    var subject = this
    if (this.controllers.length > 0) {
        this.disturb_others()
        this.controllers[0].set_callback(function(command) {
            var success = command[0].execute(subject, command[1], command[2])
            if (success) {
                // lose a bit over one pound per day due to very active lifestyle
                // remove leading 10000 when done testing
                subject.body_fat -= 10000 * (subject.body_fat + subject.lean_mass) / (86400 * 100)
                if (subject.body_fat < 0) {
                    subject.tell('You have starved.')
                    subject.notify()
                    subject.die()
                }
                callback() 
            }
            else
                subject.act(callback)
        })
    }
    else {
        // attack
        var squares = [this.square.north(), this.square.south(), this.square.east(), this.square.west()]
        for (var i = 0; i < squares.length; i++) {
            if (squares[i] && squares[i].beings.length && this.hostile(squares[i].beings[0])) {
                actions.attack.execute(subject, squares[i])
                return callback()
            }
        }
        // move randomly
        var my_actions = [actions.north, actions.south, actions.east, actions.west]
        my_actions[Math.floor(Math.random() * 4)].execute(this)
        callback()
    }
}

Being.prototype.moveto = function(square) {
    if (square.permit_entry(this)) {
        if (this.square)
            this.square.exit(this)
        this.square = square
        this.square.enter(this)
        return true;
    }
    return false;
}

Being.prototype.hostile = function(other) {
    return true;
}

Being.prototype.receive_damage = function(damage_package, attacker) {
    var damage_taken = []
    for (var damage_type in damage_package) {
        var amount = damage_package[damage_type]
        damage_taken.push([damage_type, amount])
        this.health -= amount / this.vigor
    }
    damage_taken.sort(function(a, b) { return b[1] - a[1] })
    var verb = english.verbs[damage_taken[0][0]]
    attacker.tell("You " + verb + " " + this.the() + ".")
    this.tell(attacker.The() + " " + verb.s + " you.")
    attacker.square.announce_all_but([this, attacker], attacker.The() + ' ' + verb.s + ' ' + this.the() + '.')
    if (this.health <= 0) {
        this.die()
    }
    this.redraw()
}

Being.prototype.redraw = function() {
    this.innerSpan.style.height = Math.round(this.health * 100) + '%'
}

Being.prototype.die = function() {
    this.square.announce_all_but([this], this.The() + ' dies.')
    this.tell("You die.")
    if (this.corpse)
        this.corpse.create({square: this.square, fat: this.corpse.prototype.fat * (this.body_fat + this.lean_mass * .2)})
    this.square.exit(this)
    this.dead = 1
    if (this.controllers.length > 0)
        this.universe.game_over = true
}

Being.prototype.tell = function(message) {
    this.viewports.forEach(function(viewport) {
        viewport.tell(message)
    })
}

Being.prototype.disturb = function() {
    if (!this.next_action_time) {
        universe.timeline.add_agent(this)
    }
    this.hibernating = false
}

Being.prototype.should_hibernate = function() {
    for (player_id in universe.players)
        var player = universe.players[player_id]
        if (player.square.plane == this.square.plane && player.square.coordinate.max_distance(this.square.coordinate) <= 10)
            return false;
    return true
}

Being.prototype.disturb_others = function() {
    var radius = 10
    var coordinate = this.square.coordinate
    var beings = this.square.plane.tree.search([coordinate.x - radius, coordinate.y - radius, coordinate.x + radius, coordinate.y + radius])
    for (var b = 0; b < beings.length; b++) {
        beings[b].disturb()
    }
}

Being.prototype.is_holding = function(item) {
    return (item.square.plane == this.inventory)
}

Being.prototype.gain_experience = function(exp) {
    this.experience += exp
    var new_level = this.level_from_experience(this.experience)
    if (new_level != this.level) {
        if (new_level < this.level)
            this.tell("You have regressed to level " + new_level + ".")
        else
            this.tell("You have reached level " + new_level + "!")
        this.set_level(new_level)
    }
}

Being.prototype.set_level = function(level) {
    var old_level = this.level
    this.level = level
    this.speed *= level + 9
    this.speed /= old_level + 9
    console.log('speed', this.speed)
}

Being.prototype.experience_for_level = function(level) {
    return (level - 1) * level * 5
}

Being.prototype.level_from_experience = function(experience) {
    // binary search, so experience_for_level can be edited freely
    var upper_bound = 1
    while (this.experience_for_level(upper_bound) <= experience)
        upper_bound *= 2
    var guess = upper_bound / 2
    while (upper_bound - guess > 1) {
        var mid = Math.floor((upper_bound + guess) / 2)
        if (this.experience_for_level(mid) <= experience)
            guess = mid
        else
            upper_bound = mid
    }
    return guess
}

Being.prototype.visibility = function(square) {
    if (square.plane != this.square.plane)
        return false
    var total_obstacles = 0
    var line = this.square.coordinate.line(square.coordinate)
    for (var i = 1; i < line.length-1; i++)
        total_obstacles += this.square.plane.square(line[i][0]).opacity * line[i][1]
    return Math.max(1 - total_obstacles, 0)
}
