function InventoryPlane(attributes) {
    Plane.apply(this, arguments)
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.squares['_' + x + '_' + y] = universe.biomes['inventory slot'].create({plane: this, coordinate: new Coordinate({x: x, y: y})})
        }
    }
}

InventoryPlane.prototype = Object.create(Plane.prototype)
