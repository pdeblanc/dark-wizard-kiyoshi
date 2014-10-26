function Square(attributes) {
    this.biome = attributes.biome
    this.span = document.createElement('div')
    this.span.className = 'biome ' + this.biome.name
    this.span.textContent = this.biome.symbol
    this.span.square = this
    this.items = []
    this.beings = []
    this.plane = attributes.plane
    this.coordinate = attributes.coordinate
    this.offset = function(attributes) {
        return this.plane.square(this.coordinate.add(attributes))
    }
    this.north = function() {
        return this.offset({y: -1})
    }
    this.south = function() {
        return this.offset({y: 1})
    }
    this.west = function() {
        return this.offset({x: -1})
    }
    this.east = function() {
        return this.offset({x: 1})
    }
    this.exit = function(departee) {
        var array = (departee instanceof Being) ? this.beings : this.items
        var index = array.indexOf(departee)
        if (index > -1)
            array.splice(index, 1)
        var visible_object = this.beings[0] || this.items[0]
        if (visible_object) {
            this.span.innerHTML = ''
            this.span.appendChild(visible_object.span)
        }
        else
            this.span.innerHTML = this.biome.symbol
        if (departee instanceof Being)
            this.plane.tree.remove(departee)
    }
    this.enter = function(newcomer) {
        var array = (newcomer instanceof Being) ? this.beings : this.items
        array.push(newcomer)
        if (newcomer instanceof Being || this.items.length == 1) {
            this.span.innerHTML = ''
            this.span.appendChild(newcomer.span)
        }
        if (newcomer instanceof Being) {
            this.plane.tree.insert(newcomer)
            for (var i = 0; i < this.items.length; i++) {
                newcomer.tell("You find " + this.items[i].a() + ".")
            }
        }
    }
    this.permit_entry = function(hopeful) {
        var array = (hopeful instanceof Being) ? this.beings : this.items
        if (hopeful instanceof Being) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] instanceof Being) {
                    return false;
                }
            }
        } else {
            var total_items = 0;
            for (var i = 0; i < array.length; i++) {
                if (array[i] instanceof Item) {
                    total_items += 1;
                    if (total_items >= this.biome.max_items) {
                        return false;
                    }
                }
            }
        }
        return this.biome.passable
    }
    this.announce = function(message) {
        var radius = 4;
        var coordinate = new Coordinate({x: this.coordinate.x - radius, y: this.coordinate.y - radius});
        for (; coordinate.x <= this.coordinate.x + radius; coordinate.x++) {
            for (coordinate.y = this.coordinate.y - radius; coordinate.y <= this.coordinate.y + radius; coordinate.y++) {
                var other_square = this.plane.square(coordinate)
                for (var i = 0; i < other_square.beings.length; i++) {
                    if (other_square.beings[i] instanceof Being)
                        other_square.beings[i].tell(message)
                }
            }
        }
    }
    this.set_biome = function(biome) {
        this.biome = biome
        this.span.className = 'biome ' + this.biome.name
        this.span.textContent = this.biome.symbol
    }
}

