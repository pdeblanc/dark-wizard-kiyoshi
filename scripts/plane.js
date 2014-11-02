function Plane(attributes) {
    this.width = attributes.width || 9
    this.height = attributes.height || 9
    this.squares = {}
    this.tree = rbush(9, ['.square.coordinate.x', '.square.coordinate.y', '.square.coordinate.x', '.square.coordinate.y'])
    this.square = function(coordinate) {
        if (coordinate.x < 0 || coordinate.y < 0 || coordinate.x >= this.width || coordinate.y >= this.height)
            return universe.biomes.void.create({plane: this, coordinate: coordinate})
        return this.squares['_' + coordinate.x + '_' + coordinate.y]
    }
}

Plane.prototype.vacancy = function(hopeful) {
    var coordinate = new Coordinate({x: 0, y: 0})
    for (coordinate.y = 0; coordinate.y < this.height; coordinate.y++) {
        for (coordinate.x = 0; coordinate.x < this.width; coordinate.x++) {
            var square = this.square(coordinate)
            if (square.permit_entry(hopeful)) {
                return square;
            }
        }
    }
}
Plane.prototype.place_randomly = function(hopeful) {
    for (var attempt = 0; attempt < 100; attempt++) {
        var coordinate = new Coordinate({x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height)})
        var square = this.square(coordinate)
        if (square.permit_entry(hopeful))
            return hopeful.moveto(square)
    }
    return false
}
