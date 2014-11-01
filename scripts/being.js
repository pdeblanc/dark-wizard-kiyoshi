function Being(attributes) {
    WorldObject.apply(this, arguments)
    this.compile_attributes = function() {
        // appearance
        this.symbol = this.family.symbol
        this.span.className = 'being blood'
        this.span.textContent = this.symbol
        this.innerSpan.className = this.family.name + ' being_fg'
        this.innerSpan.textContent = this.symbol
        this.span.appendChild(this.innerSpan)
        for (var i = 0; i < STATS.length; i++) {
            var stat = STATS[i]
            this[stat] = 10
            for (var j = 0; j < this.aspects.length; j++) {
                this[stat] *= (this.aspects[j][stat] || 1)
            }
        }
    }

    // basic attributes
    this.name = attributes.name
    this.family = attributes.family
    this.aspects = [this.family]
    this.aspects.push.apply(attributes.aspects || [])

    // setup
    this.square = attributes.square
    this.span = document.createElement('div')
    this.innerSpan = document.createElement('div')
    if (this.square)
        this.square.enter(this)
    this.viewports = []
    this.controllers = []

    // compile attributes
    this.compile_attributes()

    // highly mutable attributes
    this.inventory = new InventoryPlane({width: 2, height: 9})
    this.dead = 0
    this.health = 1
    this.body_fat = this.lean_mass * .3
    this.wielding = false
    this.universe.timeline.add_agent(this)
}

Being.prototype = Object.create(WorldObject.prototype)

// actions
Being.prototype.north = function() {
    return this.moveto(this.square.north())
}

Being.prototype.south = function() {
    return this.moveto(this.square.south())
}

Being.prototype.east = function() {
    return this.moveto(this.square.east())
}

Being.prototype.west = function() {
    return this.moveto(this.square.west())
}

Being.prototype.wait = function() {
    this.tell("You wait.")
    return true
}

Being.prototype.put = function(item, square) {
    var success = item.moveto(square)
    if (success)
        this.tell("You put " + item.the() + " in " + square.the() + ".")
    return success
}

Being.prototype.rest = function() {
    if (this.health >= 1) {
        this.tell("You are already fully healed!")
        return false;
    }
    this.tell('You rest...')
    this.health = Math.min(1, this.health + 0.01)
    this.redraw()
    return this.health
}

Being.prototype.get = function() {
    var gotten_items, item, vacancy
    gotten_items = []
    while ((item = this.square.items[0]) && (vacancy = this.inventory.vacancy(item))) {
        item.moveto(vacancy)
        gotten_items.push(item)
    }
    if (gotten_items.length) {
        this.tell("You get " + english.list(gotten_items) + ".")
        return true
    }
    if (this.square.items[0])
        this.tell("You do not have space for " + this.square.items[0].a() + ".")
    else
        this.tell("There is nothing to get.")
    return false
}

Being.prototype.eat = function(square) {
    if (square.items.length == 0) {
        this.tell("There is nothing there to eat.")
        return;
    }
    var item = square.items[0]
    if (!(item.fat)) {
        this.tell(item.The() + " does not appear to be edible.")
        return false;
    }
    this.tell("You eat " + item.the() + ".")
    this.body_fat += item.fat
    item.destroy()
    return true;
}

Being.prototype.look = function(square) {
    var item_names = [square.a()]
    for (var i = 0; i < square.beings.length; i++)
        item_names.push(square.beings[i].a())
    for (var i = 0; i < square.items.length; i++)
        item_names.push(square.items[i].a())
    this.tell('You see ' + english.list(item_names) + '.')
    return false
}

Being.prototype.attack = function(target_square) {
    for (var i = 0; i < target_square.beings.length; i++) {
        var being = target_square.beings[i]
        if (this.wielding) {
            being.receive_damage(this.wielding.family.attack, this)
        }
        else {
            var attack = this.family.attack
            being.receive_damage(attack, this)
        }
        return true
    }
}

Being.prototype.toggle_wield = function(square) {
    if (square.items.length == 0) {
        this.tell("There is nothing there to wield.")
        return;
    }
    var item = square.items[0]
    if (this.wielding == item)
        return this.unwield(square)
    else
        return this.wield(square)
}

Being.prototype.wield = function(square) {
    if (square.items.length == 0) {
        this.tell("There is nothing there to wield.")
        return;
    }
    var item = square.items[0]
    if (this.wielding)
        $(this.wielding.span).removeClass('wielded')
    this.wielding = item
    item.wielded_by = this
    item.span.className += ' wielded'
    this.tell('Now wielding ' + item.the() + '.')
    return true
}

Being.prototype.unwield = function(square) {
    if (this.wielding) {
        $(this.wielding.span).removeClass('wielded')
        this.wielding.wielded_by = false
    }
    this.wielding = false
    this.tell('Now wielding nothing.')
    return true
}

// methods
Being.prototype.notify = function() {
    this.viewports.forEach(function(viewport) {viewport.render()})
}

Being.prototype.act = function(callback) {
    this.notify()
    var obj = this
    if (this.controllers.length > 0) {
        this.controllers[0].set_callback(function(command) {
            var success = obj[command[0]].apply(obj, command.slice(1))
            if (success) {
                // lose a bit over one pound per day due to very active lifestyle
                // remove leading 10000 when done testing
                obj.body_fat -= 10000 * (obj.body_fat + obj.lean_mass) / (86400 * 100)
                if (obj.body_fat < 0) {
                    obj.tell('You have starved.')
                    obj.notify()
                    obj.die()
                }
                callback() 
            }
            else
                obj.act(callback)
        })
    }
    else {
        // move randomly
        var commands = [['north'], ['south'], ['west'], ['east']]
        command = commands[Math.floor(Math.random() * 4)]
        var squares = [this.square.north(), this.square.south(), this.square.east(), this.square.west()]
        // attack
        for (var i = 0; i < squares.length; i++) {
            if (squares[i] && squares[i].beings.length && this.hostile(squares[i].beings[0]))
                command = ["attack", squares[i]]
        }
        this[command[0]].apply(this, command.slice(1))
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
    new Item({
        family: universe.products.meat,
        square: this.square
    })
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


