function WildernessPlane(attributes) {
    Plane.apply(this, arguments)
    if (this.upstairs) {
        this.upstairs.downstairs = this
        if (!("level" in attributes))
            this.level = this.upstairs.level + 1
    }
}

WildernessPlane.prototype = Object.create(Plane.prototype)

WildernessPlane.prototype.feature_size_limit = 1024
WildernessPlane.prototype.width = 1024
WildernessPlane.prototype.height = 1024
WildernessPlane.prototype.light = 1


WildernessPlane.prototype.generate_square = function(coordinate) {
    if (coordinate.x % this.feature_size_limit == 0 && coordinate.y % this.feature_size_limit == 0)
        return universe.biomes.grass.create({plane: this, coordinate: coordinate})
    var parents = coordinate.lattice_parents()
    var biomes_by_probability = []
    var probability_sum = 0
    var make_stairs = Math.floor(1 + .001 - Math.random())
    for (var b in universe.biomes) {
        var activation = universe.biomes[b].prototype.bias + universe.biomes[b].prototype.affinity(this.tags)
        for (var p = 0; p < parents.length; p++) {
            activation += universe.biomes[b].prototype.affinity(this.square(parents[p]).tags)
        }
        var probability = Math.exp(activation)
        if (universe.biomes[b].prototype.can_descend && !this.downstairs || universe.biomes[b].prototype.can_ascend && !this.upstairs)
            probability = 0
        if (this.upstairs && (universe.biomes[b].prototype.can_ascend != this.upstairs.square(coordinate).can_descend))
            probability = 0
        if (universe.biomes[b].prototype.can_descend && make_stairs)
            probability *= 1000000
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

