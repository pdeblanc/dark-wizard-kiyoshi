universe.biome({name: 'grass', symbol: '草', continuous: true})
universe.biome({name: 'tree', symbol: '木', passable: false, bias: -1})
universe.biome({name: 'woods', symbol: '林', passable: true, continuous: true})
    .variant({name: 'forest', symbol: '森', continuous: false})
universe.biome({name: 'water', symbol: '水', passable: false, continuous: true})
universe.biome({name: 'void', symbol: '無', passable: 0, bias: -100, continuous: true})
    .variant({name: 'inventory slot', passable: 1, max_items: 1, continuous: false})

universe.friends('grass', 'grass')
universe.friends('water', 'water')

