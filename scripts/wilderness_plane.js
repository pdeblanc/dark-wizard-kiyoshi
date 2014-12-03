function WildernessPlane(attributes) {
    Plane.apply(this, arguments)
    if (this.upstairs) {
        this.upstairs.downstairs = this
        if (!("level" in attributes))
            this.level = this.upstairs.level + 1
    }
    this.biomes = []
    this.suggestions = {}
    this.seed = this.level
}

WildernessPlane.prototype = Object.create(Plane.prototype)

WildernessPlane.prototype.feature_size_limit = 1024
WildernessPlane.prototype.width = 1024
WildernessPlane.prototype.height = 1024
WildernessPlane.prototype.light = 1
WildernessPlane.prototype.seed = 0

WildernessPlane.prototype.generate_square = function(coordinate) {
    // suggest a square, which may be stairs
    var square = this.suggestion(coordinate, 1)
    // filter out squares that don't have matching stairs
    if (square.can_descend && !this.downstairs.suggestion(coordinate, 1).can_ascend || square.can_ascend && !this.upstairs.suggestion(coordinate, 1).can_descend)
        square = this.suggestion(coordinate, 2)
    return square
}

WildernessPlane.prototype.suggestion = function(coordinate, trial) {
    var key = coordinate.x + '_' + coordinate.y + '_' + trial
    if (!(key in this.suggestions))
        this.suggestions[key] = this.suggest(coordinate, trial)
    return this.suggestions[key]
}

WildernessPlane.prototype.suggest = function(coordinate, trial) {
    trial = trial || 1
    if (coordinate.x % this.feature_size_limit == 0 && coordinate.y % this.feature_size_limit == 0)
        return universe.biomes.grass.create({plane: this, coordinate: coordinate})
    if (this.biomes.length == 0) {
        this.biomes = values_by_sorted_keys(universe.biomes)
    }
    var parents = coordinate.lattice_parents()
    var biomes_by_probability = []
    var probability_sum = 0
    for (var i = 0; i < this.biomes.length; i++) {
        var biome = this.biomes[i]
        var activation = biome.prototype.bias + biome.prototype.affinity(this.tags)
        for (var p = 0; p < parents.length; p++) {
            activation += biome.prototype.affinity(this.square(parents[p]).tags)
        }
        var probability = Math.exp(activation)
        if (biome.prototype.can_descend && (trial > 1 || !this.downstairs) || biome.prototype.can_ascend && (trial > 1 || !this.upstairs))
            probability = 0
        biomes_by_probability.push([biome, probability])
        probability_sum += probability
    }
    var biome = Probability.sample(biomes_by_probability, coordinate.seed() + 'biome' + this.seed)
    return biome.create({plane: this, coordinate: new Coordinate({x: coordinate.x, y: coordinate.y})})
}

WildernessPlane.prototype.serialize = function() {
    // returns a list of squares in which items or beings have been revealed.
    // this allows us to avoid creating duplicates of things that have moved
    var output = []
    for (var key in this.squares) {
        if (this.squares[key].populated)
            output.push(key)
    }
    output.sort()
    return output
}

WildernessPlane.prototype.serialize_beings = function() {
    var output = []
    for (var key in this.squares) {
        var square = this.squares[key]
        for (var i = 0; i < square.beings.length; i++)
            output.push(square.beings[i].serialize())
    }
    return output
}

WildernessPlane.prototype.serialize_items = function() {
    var output = []
    for (var key in this.squares) {
        var square = this.squares[key]
        for (var i = 0; i < square.items.length; i++)
            output.push(square.items[i].serialize())
    }
    return output
}
