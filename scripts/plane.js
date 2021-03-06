function Plane(attributes) {
    if (attributes)
        for (var key in attributes)
            this[key] = attributes[key];
    this.squares = {};
    this.tree = rbush(9, ['.square.coordinate.x', '.square.coordinate.y', '.square.coordinate.x', '.square.coordinate.y']);
    this.light_sources = rbush(9, ['.square.coordinate.x', '.square.coordinate.y', '.square.coordinate.x', '.square.coordinate.y']);
}

Plane.prototype.width = 9;
Plane.prototype.height = 9;
Plane.prototype.level = 1;
Plane.prototype.tags = [];
Plane.prototype.light = 1;
Plane.prototype.emptied_square_keys = {};

Plane.prototype.square = function(coordinate) {
    var index_string = '_' + coordinate.x + '_' + coordinate.y;
    if (!(index_string in this.squares))
        return (this.squares[index_string] = this.generate_square(coordinate));
    return this.squares[index_string];
};

Plane.prototype.generate_square = function(coordinate) {
    return universe.biomes.void.create({plane: this, coordinate: coordinate});
};

Plane.prototype.vacancy = function(hopeful) {
    var coordinate = new Coordinate({x: 0, y: 0});
    for (coordinate.y = 0; coordinate.y < this.height; coordinate.y++) {
        for (coordinate.x = 0; coordinate.x < this.width; coordinate.x++) {
            var square = this.square(coordinate);
            if (square.permit_entry(hopeful)) {
                return square;
            }
        }
    }
};

Plane.prototype.place_randomly = function(hopeful, seed) {
    for (var attempt = 0; attempt < 100; attempt++) {
        var coordinate = new Coordinate({x: Math.floor(Probability.srandom(seed + 'x' + attempt) * this.width), y: Math.floor(Probability.srandom(seed + 'y' + attempt) * this.height)});
        var square = this.square(coordinate);
        if (square.permit_entry(hopeful))
            return hopeful.moveto(square);
    }
    return false;
};

Plane.prototype.random_being = function() {
    while (true) {
        var coordinate = new Coordinate({x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height)});
        var square = this.square(coordinate);
        if (square.beings.length)
            return square.beings[0];
    }
};
