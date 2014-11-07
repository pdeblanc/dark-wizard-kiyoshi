function WildernessPlane(attributes) {
    Plane.apply(this, arguments)
    console.log(attributes)
    if (this.upstairs)
        this.upstairs.downstairs = this
}

WildernessPlane.prototype = Object.create(Plane.prototype)

WildernessPlane.prototype.feature_size_limit = 1024

WildernessPlane.prototype.generate_square = function(coordinate) {
    if (coordinate.x % this.feature_size_limit == 0 && coordinate.y % this.feature_size_limit == 0)
        return universe.biomes.grass.create({plane: this, coordinate: coordinate})
    var parents = coordinate.lattice_parents()

    var biomes_by_probability = []
    var probability_sum = 0
    for (var b in universe.biomes) {
        var activation = universe.biomes[b].prototype.bias;
        for (var p = 0; p < parents.length; p++) {
            var square = this.square(parents[p])
            activation += universe.biomes[b].prototype.affinity(square)
        }
        var probability = Math.exp(activation)
        if (universe.biomes[b].prototype.can_descend && !this.downstairs || universe.biomes[b].prototype.can_ascend && !this.upstairs)
            probability = 0
        if (this.upstairs && (universe.biomes[b].prototype.can_ascend != this.upstairs.square(coordinate).can_descend))
            probability = 0
        biomes_by_probability.push([universe.biomes[b], probability])
        probability_sum += probability
    }
    var biome = biomes_by_probability[0][0]
    var R = Math.random() * probability_sum
    for (var b = 0; b < biomes_by_probability.length; b++) {
        if (R < biomes_by_probability[b][1]) {
            biome = biomes_by_probability[b][0]
            break
        }
        R -= biomes_by_probability[b][1]
    }
    return biome.create({plane: this, coordinate: new Coordinate({x: coordinate.x, y: coordinate.y})})
}

