Being = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    // graphics
    this.span = document.createElement('div')
    this.innerSpan = document.createElement('div')
    this.span.className = 'being blood'
    this.span.textContent = this.symbol
    this.innerSpan.className = this.__proto__.name + ' being_fg'
    this.innerSpan.textContent = this.symbol
    this.span.appendChild(this.innerSpan)

    if (this.square)
        this.square.enter(this)
    this.viewports = []
    this.controllers = []

    // highly mutable attributes
    this.inventory = new InventoryPlane(this.inventory)
    this.dead = 0
    this.health = 1
    this.body_fat = this.lean_mass * .3
    this.wielding = false
    this.hibernating = false
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
    universe.products.meat.create({square: this.square, fat: this.body_fat + this.lean_mass * .2})
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
        if (universe.players[player_id].square.coordinate.max_distance(this.square.coordinate) <= 10)
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
