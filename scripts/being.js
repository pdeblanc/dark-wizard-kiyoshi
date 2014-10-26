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

    // actions
    this.north = function() {
        return this.moveto(this.square.north())
    }

    this.south = function() {
        return this.moveto(this.square.south())
    }

    this.east = function() {
        return this.moveto(this.square.east())
    }

    this.west = function() {
        return this.moveto(this.square.west())
    }

    this.get = function() {
        for (var i = 0; i < this.square.items.length; i++) {
            var item = this.square.items[i]
            var vacancy = this.inventory.vacancy(item)
            if (vacancy) {
                item.moveto(vacancy)
                this.tell("You get " + item.a() + ".")
                return true;
            }
        }
        if (item)
            this.tell("You do not have space for " + item.a() + ".")
        else
            this.tell("There is nothing to get.")
        return false;
    }

    this.eat = function(item) {
        if (!("fat" in item)) {
            this.tell(item.The() + " does not appear to be edible.")
            return false;
        }
        this.tell("You eat " + item.the() + ".")
        this.body_fat += item.fat
        item.destroy()
    }

    this.attack = function(target_square) {
        for (var i = 0; i < target_square.beings.length; i++) {
            var being = target_square.beings[i]
            if (this.wielding) {
                being.receive_damage(this.wielding.damage(), this)
            }
            else {
                being.receive_damage({punch: 1}, this)
            }
            return true;
        }
    }

    this.toggle_wield = function(item) {
        if (this.wielding == item)
            this.unwield(item)
        else
            this.wield(item)
    }

    this.wield = function(item) {
        if (this.wielding)
            $(this.wielding.span).removeClass('wielded')
        this.wielding = item
        item.span.className += ' wielded'
        this.tell('Now wielding ' + item.the() + '.')
    }

    this.unwield = function(item) {
        this.wielding = false
        $(item.span).removeClass('wielded')
        this.tell('Now wielding nothing.')
    }

    // methods
    this.notify = function() {
        this.viewports.forEach(function(viewport) {viewport.render()})
    }

    this.act = function(callback) {
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
            var actions = ['north', 'south', 'west', 'east']
            action = actions[Math.floor(Math.random() * 4)]
            this[action]()
            callback()
        }
    }

    this.moveto = function(square) {
        if (square.permit_entry(this)) {
            if (this.square)
                this.square.exit(this)
            this.square = square
            this.square.enter(this)
            return true;
        }
        return false;
    }

    this.receive_damage = function(damage_package, attacker) {
        var damage_taken = []
        for (var damage_type in damage_package) {
            var amount = damage_package[damage_type]
            damage_taken.push([damage_type, amount])
            this.health -= amount / this.vigor
        }
        damage_taken.sort(function(a, b) { return b[1] - a[1] })
        var primary_damage_type = damage_taken[0][0]
        attacker.tell("You " + primary_damage_type + " " + this.the() + ".")
        if (this.health <= 0) {
            this.die()
        }
        this.innerSpan.style.height = Math.round(this.health * this.span.offsetHeight * .8) + 'px'
    }

    this.die = function() {
        this.square.announce(this.The() + ' dies.')
        new Item({
            family: universe.products.meat,
            square: this.square
        })
        this.square.exit(this)
        this.dead = 1
    }

    this.tell = function(message) {
        this.viewports.forEach(function(viewport) {
            viewport.tell(message)
        })
    }
}

