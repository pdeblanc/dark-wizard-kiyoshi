function Square(attributes) {
    WorldObject.apply(this, arguments)
    this.biome = attributes.biome
    this.family = this.biome
    this.span = document.createElement('div')
    this.span.className = 'biome ' + this.biome.name
    this.span.textContent = this.biome.symbol
    this.span.square = this
    this.items = []
    this.beings = []
    this.plane = attributes.plane
    this.coordinate = attributes.coordinate
}

Square.prototype = Object.create(WorldObject.prototype)

Square.prototype.offset = function(attributes) {
    return this.plane.square(this.coordinate.add(attributes))
}
Square.prototype.north = function() {
    return this.offset({y: -1})
}
Square.prototype.south = function() {
    return this.offset({y: 1})
}
Square.prototype.west = function() {
    return this.offset({x: -1})
}
Square.prototype.east = function() {
    return this.offset({x: 1})
}
Square.prototype.exit = function(departee) {
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
Square.prototype.enter = function(newcomer) {
    var array = (newcomer instanceof Being) ? this.beings : this.items
    array.push(newcomer)
    if (newcomer instanceof Being || this.items.length == 1) {
        this.span.innerHTML = ''
        this.span.appendChild(newcomer.span)
    }
    if (newcomer instanceof Being) {
        this.plane.tree.insert(newcomer)
        if (this.items.length)
            newcomer.tell("You find " + english.list(this.items) + ".")
    }
}
Square.prototype.permit_entry = function(hopeful) {
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
Square.prototype.announce_all_but = function(exclude, message) {
    var radius = 4;
    var beings = this.plane.tree.search([this.coordinate.x - radius, this.coordinate.y - radius, this.coordinate.x + radius, this.coordinate.y + radius])
    for (var b = 0; b < beings.length; b++) {
        if (exclude.indexOf(beings[b]) == -1)
            beings[b].tell(message)
    }
}
Square.prototype.announce = function(message) {
    this.announce_all_but([], message)
}
Square.prototype.set_biome = function(biome) {
    this.biome = biome
    this.family = this.biome
    this.span.className = 'biome ' + this.biome.name
    this.span.textContent = this.biome.symbol
}


