var universe = {
    species: {human: new Species({name: 'human', symbol: '人', lean_mass: 10})},
    products: {
        katana: new Product({name: 'katana', symbol: '刀', action: 'toggle_wield', damage: function() { return {'cut': 5} }}),
        longsword: new Product({name: 'longsword', symbol: '剣', action: 'toggle_wield', damage: function() { return {'cut': 5} }}),
        meat: new Product({name: 'meat', symbol: '肉', fat: 2, action: 'eat'})
    }
}

console.log('universe', universe)
