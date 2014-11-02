function InventoryPlane(attributes) {
    Plane.apply(this, arguments)
}

InventoryPlane.prototype = Object.create(Plane.prototype)

InventoryPlane.prototype.generate_square = function(coordinate) {
    if (coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < this.width && coordinate.y < this.height)
        return universe.biomes['inventory slot'].create({plane: this, coordinate: coordinate})
    return universe.biomes.void.create({plane: this, coordinate: coordinate})
}
