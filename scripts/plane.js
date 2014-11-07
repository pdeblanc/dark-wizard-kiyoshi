function Plane(attributes) {
    if (attributes)
        for (key in attributes)
            this[key] = attributes[key]
    this.squares = {}
    this.tree = rbush(9, ['.square.coordinate.x', '.square.coordinate.y', '.square.coordinate.x', '.square.coordinate.y'])
}

Plane.prototype.width = 9

Plane.prototype.height = 9

Plane.prototype.square = function(coordinate) {
    var index_string = '_' + coordinate.x + '_' + coordinate.y
    if (!(index_string in this.squares))
        return (this.squares[index_string] = this.generate_square(coordinate))
    return this.squares[index_string]
}

Plane.prototype.generate_square = function(coordinate) {
    return universe.biomes.void.create({plane: this, coordinate: coordinate})
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
