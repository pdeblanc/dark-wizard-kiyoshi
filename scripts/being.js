Being = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    // graphics
    this.skin = $('<div />').addClass(this.className).text(this.symbol).addClass('skin')
    this.blood = $('<div />').addClass("blood being").text(this.symbol)
    this.foreground = centralizer($('<div />').append(this.blood).append(this.skin).addClass('blood-and-skin-container'))

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
    this.body_fat = this.lean_weight * .3
    this.wielding = false
    this.hibernating = false
    this.level = Math.ceil(this.level)
    this.experience = this.experience_for_level(this.level)
    this.knowledge = {} // which sorts of magical tea the being has identified
    this.thoughts = {}
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

Being.prototype.hands = 0


// methods
Being.prototype.notify = function() {
    this.viewports.forEach(function(viewport) {viewport.render()})
}

Being.prototype.digest = function() {
    // lose a bit over one pound per day due to very active lifestyle
    // remove leading 10000 when done testing
    weight_lost = 1000 * (this.body_fat + this.lean_weight) / (86400 * 100)
    if (this.controllers.length)
        weight_lost *= 4
    if (this.viewports.length)
        weight_lost *= 2.5
    this.body_fat -= weight_lost
    if (this.body_fat < 0) {
        this.tell('You have starved.')
        this.notify()
        this.die()
    }
}

Being.prototype.act = function(callback) {
    this.digest()
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
                callback() 
            }
            else
                subject.act(callback)
        })
    }
    else {
        // wield weapons
        if (this.hands) {
            var quality = this.weapon_quality(this)
            if (this.wielding)
                quality = this.wielding.weapon_quality(this)
            var possible_weapons = this.reachable_items()
            for (var i = 0; i < possible_weapons.length; i++) {
                if (possible_weapons[i].weapon_quality(this) > quality) {
                    var success = actions.wield.execute(this, possible_weapons[i])
                    if (success)
                        return callback()
                }
            }
        }
        // attack
        var squares = [this.square.north(), this.square.south(), this.square.east(), this.square.west()]
        for (var i = 0; i < squares.length; i++) {
            if (squares[i] && squares[i].beings.length && this.hostile(squares[i].beings[0])) {
                actions.attack.execute(subject, squares[i])
                return callback()
            }
        }
        // eat
        if (this.hunger() > 0) {
            var possible_food = this.reachable_items()
            for (var i = 0; i < possible_food.length; i++) {
                if (possible_food[i].fat) {
                    actions.eat.execute(this, possible_food[i])
                    return callback()
                }
            }
        }
        // rest if not hungry
        if (this.hunger() <= 0 && this.health < 1) {
            actions.rest.execute(this)
            return callback()
        }
        // collect items
        if (this.square.items.length && this.inventory.vacancy(this.square.items[0])) {
            actions.get.execute(this)
            return callback()
        }
        // move
        if (!this.thoughts.direction || !this.square[this.thoughts.direction]().permit_entry(this) || Math.random() < .03)
            this.thoughts.direction = ['north', 'south', 'east', 'west'][Math.floor(Math.random()*4)]
        actions[this.thoughts.direction].execute(this)
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
    attacker.tell("You " + verb + " " + this.the(attacker) + ".")
    this.tell(attacker.The(this) + " " + verb.s + " you.")
    attacker.square.announce_all_but([this, attacker], attacker.The() + ' ' + verb.s + ' ' + this.the() + '.')
    if (this.health <= 0) {
        this.die()
    }
}

Being.prototype.redraw = function() {
    this.skin.height(Math.round(this.health * 100) + '%')
}

Being.prototype.die = function() {
    this.square.announce_all_but([this], this.The() + ' dies.')
    this.tell("You die.")
    var items = this.inventory.items()
    for (var i = 0; i < items.length; i++)
        actions.drop.execute(this, items[i])
    if (this.corpse)
        this.corpse.create({square: this.square, fat: this.corpse.prototype.fat * (this.body_fat + this.lean_weight * .2)})
    this.square.exit(this)
    this.dead = 1
    this.notify()
    if (this.viewports.length > 0) {
        $("#game-over").css('display', 'table').click(function() { location.reload() })
        universe.game_over = true
        var new_being = this.square.plane.random_being()
        this.viewports[0].set_being(new_being)
    }
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
    this.speed *= (level - Math.ceil(this.__proto__.level)) + 9
    this.speed /= (old_level - Math.ceil(this.__proto__.level)) + 9
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
    if (square.plane != this.square.plane) // probably in inventory
        return 1
    var total_obstacles = 0
    var line = this.square.coordinate.line(square.coordinate)
    for (var i = 1; i < line.length-1; i++)
        total_obstacles += this.square.plane.square(line[i][0]).opacity * line[i][1]
    return Math.max(1 - total_obstacles, 0)
}

Being.prototype.can_reach = function(square) {
    if (square.plane == this.square.plane && square.coordinate.taxicab_distance(this.square.coordinate) <= 1)
        return true
    if (square.plane == this.inventory)
        return true
    return false
}

Being.prototype.reachable_items = function() {
    return this.square.items
        .concat(this.inventory.items())
        .concat(this.square.north().items)
        .concat(this.square.south().items)
        .concat(this.square.east().items)
        .concat(this.square.west().items)
}

Being.prototype.hunger = function() {
    return this.lean_weight * .3 - this.body_fat
}
