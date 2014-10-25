universe.biomes = {
    grass: new Biome({
        name: 'grass',
        symbol: '草'
    }),
    tree: new Biome({
        name: 'tree',
        symbol: '木',
        passable: false
    }),
    woods: new Biome({
        name: 'woods',
        symbol: '林',
        passable: true
    }),
    forest: new Biome({
        name: 'forest',
        symbol: '森',
        passable: true
    }),
    water: new Biome({
        name: 'water',
        symbol: '水',
        passable: false
    }),
    void: new Biome({
        name: 'void',
        symbol: '無',
        passable: 0,
        bias: -100
    }),
    empty: new Biome({
        name: 'empty',
        symbol: '無',
        max_items: 1,
        bias: -100 
    })
}

universe.affinity.friends('grass', 'grass')
universe.affinity.friends('water', 'water')

