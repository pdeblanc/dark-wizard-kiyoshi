function Square(attributes) {
    this.biome = attributes.biome
    this.span = document.createElement('div')
    this.span.className = 'biome ' + this.biome.name
    this.span.textContent = this.biome.symbol
    this.span.square = this
    this.contents = []
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
        var index = this.contents.indexOf(departee)
        if (index > -1)
            this.contents.splice(index, 1)
        if (this.contents.length > 0) {
            this.span.innerHTML = ''
            this.span.appendChild(this.contents[0].span)
        }
        else
            this.span.innerHTML = this.biome.symbol
    }
    this.enter = function(newcomer) {
        this.contents.push(newcomer)
        this.span.innerHTML = ''
        this.span.appendChild(newcomer.span)
    }
    this.permit_entry = function(hopeful) {
        if (hopeful instanceof Being) {
            for (var i = 0; i < this.contents.length; i++) {
                if (this.contents[i] instanceof Being) {
                    return false;
                }
            }
        } else {
            var total_items = 0;
            for (var i = 0; i < this.contents.length; i++) {
                if (this.contents[i] instanceof Item) {
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
                for (var i = 0; i < other_square.contents.length; i++) {
                    if (other_square.contents[i] instanceof Being)
                        other_square.contents[i].tell(message)
                }
            }
        }
    }
}

