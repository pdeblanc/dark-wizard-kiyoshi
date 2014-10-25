function WildernessPlane(attributes) {
    Plane.apply(this, arguments)
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var biome = universe.biomes.water;
            this.squares['_' + x + '_' + y] = new Square({biome: biome, plane: this, coordinate: new Coordinate({x: x, y: y})})
        }
    }
    var coordinate = new Coordinate({x: 0, y: 0})
    for (var i = 0; i < 3; i++) {
        biome_counts = {}
        for (coordinate.x = 0; coordinate.x < this.width; coordinate.x++) {
            for (coordinate.y = 0; coordinate.y < this.height; coordinate.y++) {
                var square = this.square(coordinate)
                var biomes_by_probability = []
                var probability_sum = 0
                for (var b in universe.biomes) {
                    var activation = universe.biomes[b].bias;
                    if (x > 0)
                        activation += universe.biomes[b].affinity(square.west().biome)
                    if (y > 0)
                        activation += universe.biomes[b].affinity(square.north().biome)
                    if (x < this.width - 1)
                        activation += universe.biomes[b].affinity(square.east().biome)
                    if (y < this.height - 1)
                        activation += universe.biomes[b].affinity(square.south().biome)
                    var probability = Math.exp(activation)
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
                if (!(biome.name in biome_counts))
                    biome_counts[biome.name] = 0
                biome_counts[biome.name] += 1
                this.square(coordinate).set_biome(biome)
            }
        }
        console.log(JSON.stringify(biome_counts))
    }

}

