Square = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    this.span = document.createElement('div')
    this.span.className = 'biome ' + this.className
    this.span.textContent = this.symbol
    this.span.square = this
    this.items = []
    this.beings = []
    this.plane = attributes.plane
    this.coordinate = attributes.coordinate
    var being, item
    if (being = this.sample_contents(universe.clades))
        being.create({square: this})
    if (item = this.sample_contents(universe.products))
        item.create({square: this})
    this.name = this.name.replace(/[0-9]/g, "")
})

Square.variant = function(attributes, f) {
    var F = WorldObject.variant.apply(this, arguments)
    F.prototype.tags = [F.prototype.name]
    if ('tags' in attributes)
        F.prototype.extra_tags = attributes.tags
    for (var t = 0; t < F.prototype.extra_tags.length; t++)
        F.prototype.tags.push(F.prototype.extra_tags[t])
    F.affinity = Square.affinity
    if (universe.affinity(F.prototype.name, F.prototype.name) === false)
        universe.affinity(F.prototype.name, F.prototype.name, F.prototype.clumpiness)
    return F
}

Square.set_name = 'biomes'

Square.prototype = Object.create(WorldObject.prototype)

Square.prototype.name = 'square'
Square.prototype.extra_tags = []

Square.prototype.walkable = false
Square.prototype.swimmable = false
Square.prototype.flyable = false
Square.prototype.can_descend = false
Square.prototype.can_ascend = false

Square.prototype.max_beings = 1
Square.prototype.max_items = 16
Square.prototype.tags = []
Square.prototype.bias = 0
Square.prototype.clumpiness = 1


// index is an object whose keys are things that may be placed in the square
Square.prototype.sample_contents = function(index) {
    var probability_array = [[false, 1]]
    for (key in index) {
        var object_class = index[key]
        if (this.permit_entry(object_class.prototype) && object_class.prototype.level <= this.plane.level)
            probability_array.push([object_class, Math.exp(object_class.prototype.bias)])
    }
    return Probability.sample(probability_array)
}

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
    if (hopeful instanceof Being && this.beings.length < this.max_beings)
        return ((this.walkable && hopeful.can_walk) || (this.flyable && hopeful.can_fly) || (this.swimmable && hopeful.can_swim))
    if (hopeful instanceof Item)
        return (this.items.length < this.max_items)
    return false
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
Square.prototype.next_to = function(other) {
    return (other == this.north() || other == this.south() || other == this.west() || other == this.east())
}
