function InventoryPlane(attributes) {
    Plane.apply(this, arguments)
}

InventoryPlane.prototype = Object.create(Plane.prototype)
InventoryPlane.prototype.label_symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

InventoryPlane.prototype.generate_square = function(coordinate) {
    if (coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < this.width && coordinate.y < this.height)
        return universe.biomes['inventory slot'].create({plane: this, coordinate: coordinate})
    return universe.biomes.void.create({plane: this, coordinate: coordinate})
}

InventoryPlane.prototype.label_for = function(coordinate) {
    return this.label_symbols[coordinate.x + this.width * coordinate.y]
}

InventoryPlane.prototype.get_by_label = function(label) {
    var i = this.label_symbols.indexOf(label)
    if (i > -1 && i < this.width * this.height)
        return this.square(new Coordinate({y: Math.floor(i / this.width), x: i % this.width}))
    return false
}

