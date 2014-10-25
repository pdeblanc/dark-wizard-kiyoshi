universe.biome({
    name: 'grass',
    symbol: '草'
})
universe.biome({
    name: 'tree',
    symbol: '木',
    passable: false,
    bias: -1
})
universe.biome({
    name: 'woods',
    symbol: '林',
    passable: true
})
universe.biome({
    name: 'forest',
    symbol: '森',
    passable: true
})
universe.biome({
    name: 'water',
    symbol: '水',
    passable: false
})
universe.biome({
    name: 'void',
    symbol: '無',
    passable: 0,
    bias: -100
})
universe.biome({
    name: 'empty',
    symbol: '無',
    max_items: 1,
    bias: -100 
})

universe.affinity.friends('grass', 'grass')
universe.affinity.friends('water', 'water')

