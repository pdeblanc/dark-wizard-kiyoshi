function Being(attributes) {
    this.compile_attributes = function() {
        // appearance
        this.symbol = this.species.symbol
        this.span.className = 'being blood'
        this.span.textContent = this.symbol
        this.innerSpan.className = this.species.name + ' being_fg'
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
    this.species = attributes.species
    this.aspects = [this.species]
    this.aspects.push.apply(attributes.aspects || [])

    // highly mutable attributes
    this.square = attributes.square
    this.inventory = new InventoryPlane({width: 2, height: 9})
    this.dead = 0
    this.health = 1
    this.wielding = false

    // setup
    this.span = document.createElement('div')
    this.innerSpan = document.createElement('div')
    this.square.enter(this)
    this.viewports = []
    this.controllers = []

    // compile attributes
    this.compile_attributes()

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
        for (var i = 0; i < this.square.contents.length; i++) {
            var item = this.square.contents[i]
            if (item instanceof Item) {
                var vacancy = this.inventory.vacancy(item)
                if (vacancy) {
                    item.moveto(vacancy)
                    this.tell("You get " + item.title() + ".")
                    return true;
                }
            }
        }
        this.tell("You do not have space for " + item.title() + ".")
        return false;
    }

    this.attack = function(target_square) {
        for (var i = 0; i < target_square.contents.length; i++) {
            if (target_square.contents[i] instanceof Being) {
                var item = target_square.contents[i]
                if (this.wielding)
                    this.tell('You attack ' + item.title() + ' with ' + this.wielding.title() + '.')
                else
                    this.tell('You attack ' + item.title() + '.')
                if (item instanceof Being) {
                    if (this.wielding) {
                        item.receive_damage({cut: 5})
                    }
                    else {
                        item.receive_damage({punch: 1})
                    }
                }
                return true;
            }
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
        this.tell('Now wielding ' + item.title() + '.')
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
                if (success)
                    callback() 
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
            this.square.exit(this)
            this.square = square
            this.square.enter(this)
            for (var i = 0; i < this.square.contents.length; i++) {
                var item = this.square.contents[i]
                if (item != this)
                    this.tell("You find " + item.title() + ".")
            }
            return true;
        }
        return false;
    }

    this.receive_damage = function(damage_package) {
        for (var damage_type in damage_package) {
            var amount = damage_package[damage_type]
            this.health -= amount / this.vigor
        }
        if (this.health <= 0) {
            this.die()
        }
        this.innerSpan.style.height = Math.round(this.health * this.span.offsetHeight * .8) + 'px'
    }

    this.die = function() {
        this.square.announce(this.titlec() + ' dies.')
        new Item({
            product: universe.products.meat,
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

    this.titlec = function() {
        var title = this.title()
        return title.charAt(0).toUpperCase() + title.slice(1)
    }

    this.title = function() {
        return "the " + this.species.name
    }
}

