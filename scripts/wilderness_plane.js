function WildernessPlane(attributes) {
    Plane.apply(this, arguments)
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var biome = universe.biomes.grass;
            if (Math.random() < .2)
                biome = universe.biomes.water
            this.squares['_' + x + '_' + y] = new Square({biome: biome, plane: this, coordinate: new Coordinate({x: x, y: y})})
        }
    }
}

