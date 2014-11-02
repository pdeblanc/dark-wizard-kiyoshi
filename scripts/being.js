Being = WorldObject.variant({}, function(attributes) {
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
    this.inventory = new InventoryPlane({width: 2, height: 9})
    this.dead = 0
    this.health = 1
    this.body_fat = this.lean_mass * .3
    this.wielding = false
    universe.timeline.add_agent(this)
})

Being.set_name = 'clades'

Being.prototype = Object.create(WorldObject.prototype)

Being.prototype.power = 10
Being.prototype.speed = 10
Being.prototype.vigor = 10

// methods
Being.prototype.notify = function() {
    this.viewports.forEach(function(viewport) {viewport.render()})
}

Being.prototype.act = function(callback) {
    this.notify()
    var subject = this
    if (this.controllers.length > 0) {
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
    universe.products.meat.create({square: this.square})
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

