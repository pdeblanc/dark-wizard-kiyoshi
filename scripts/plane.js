function Plane(attributes) {
    this.width = attributes.width
    this.height = attributes.height
    this.squares = {}
    this.square = function(coordinate) {
        if (coordinate.x < 0 || coordinate.y < 0 || coordinate.x >= this.width || coordinate.y >= this.height)
            return new Square({biome: universe.biomes.void, plane: this, coordinate: coordinate})
        return this.squares['_' + coordinate.x + '_' + coordinate.y]
    }
    this.vacancy = function(hopeful) {
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
}

