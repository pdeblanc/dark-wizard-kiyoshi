Square = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    this.span = document.createElement('div')
    this.span.className = 'biome ' + this.name
    this.span.textContent = this.symbol
    this.span.square = this
    this.items = []
    this.beings = []
    this.plane = attributes.plane
    this.coordinate = attributes.coordinate
    for (clade_name in universe.clades) {
        clade = universe.clades[clade_name]
        if (Math.random() < .01 && this.permit_entry(clade.prototype)) {
            clade.create({square: this})
            break
        }
    }
    for (product_name in universe.products) {
        product = universe.products[product_name]
        if (Math.random() < .01 && this.permit_entry(product.prototype)) {
            product.create({square: this})
            break
        }
    }
})

Square.variant = function(attributes, f) {
    var F = WorldObject.variant.apply(this, arguments)
    F.prototype.tags = [F.prototype.name]
    F.affinity = Square.affinity
    if (universe.affinity(F.prototype.name, F.prototype.name) === false)
        universe.affinity(F.prototype.name, F.prototype.name, F.prototype.clumpiness)
}

Square.set_name = 'biomes'

Square.prototype = Object.create(WorldObject.prototype)

Square.prototype.passable = true

Square.prototype.max_beings = 1

Square.prototype.max_items = 16

Square.prototype.bias = 0

Square.prototype.tags = []

Square.prototype.clumpiness = 1

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
        this.span.innerHTML = this.symbol
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
    if (hopeful instanceof Being && this.beings.length >= this.max_beings)
        return false
    if (hopeful instanceof Item && this.items.length >= this.max_items)
        return false
    return this.passable
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
Square.prototype.affinity = function(other) {
    var total = 0;
    for (var i = 0; i < this.tags.length; i++) {
        for (var j = 0; j < other.tags.length; j++) {
            total += universe.affinity(this.tags[i], other.tags[j])
        }
    }
    return total;
}
