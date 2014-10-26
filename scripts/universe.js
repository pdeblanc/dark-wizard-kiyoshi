function Universe(attributes) {
    this.clades = {}
    this.products = {}
    this.biomes = {}

    this.clade = function(attributes) {
        var clade = new Clade(attributes)
        this.clades[clade.name] = clade
    }

    this.product = function(attributes) {
        var product = new Product(attributes)
        this.products[product.name] = product
    }

    this.biome = function(attributes) {
        var biome = new Biome(attributes)
        this.biomes[biome.name] = biome
    }
} 

var universe = new Universe()

universe.clade({name: 'human', symbol: '人', lean_mass: 10})
universe.clade({name: 'blue dragon', symbol: '龍', lean_mass: 200, vigor: 20})
universe.product({name: 'katana', symbol: '刀', action: 'toggle_wield', damage: function() { return {'cut': 5} }})
universe.product({name: 'longsword', symbol: '剣', action: 'toggle_wield', damage: function() { return {'cut': 5} }})
universe.product({name: 'meat', symbol: '肉', fat: 2, action: 'eat'})
