universe.biome({name: 'grass', symbol: '草'})
universe.biome({name: 'tree', symbol: '木', passable: false, bias: -1})
universe.biome({name: 'woods', symbol: '林', passable: true})
    .variant({name: 'forest', symbol: '森'})
universe.biome({name: 'water', symbol: '水', passable: false})
universe.biome({name: 'void', symbol: '無', passable: 0, bias: -100})
    .variant({name: 'empty', passable: 1, max_items: 1})

universe.friends('grass', 'grass')
universe.friends('water', 'water')

