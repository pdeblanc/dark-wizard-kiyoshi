function Universe(attributes) {
    this.clades = {}
    this.products = {}
    this.biomes = {}
    this.affinities = {}
    this.game_over = false
    this.timeline = new Timeline({start_time: 0, universe: this})


} 

Universe.prototype.simulate = function() {
    this.timeline.simulate()
}

Universe.prototype.clade = function(attributes) {
    attributes.universe = this
    return new Clade(attributes)
}

Universe.prototype.product = function(attributes) {
    attributes.universe = this
    return new Product(attributes)
}

Universe.prototype.biome = function(attributes) {
    attributes.universe = this
    return new Biome(attributes)
}

Universe.prototype.affinity = function(a, b, x) {
    if (x == undefined) {
        if (a in this.affinities && b in this.affinities[a])
            return this.affinities[a][b]
        return 0
    }
    this.affinities[a] = this.affinities[a] || {}
    this.affinities[b] = this.affinities[b] || {}
    this.affinities[a][b] = this.affinities[b][a] = x
}

Universe.prototype.friends = function(a, b) {
    this.affinity(a, b, 1)
}

Universe.prototype.foes = function(a, b) {
    this.affinity(a, b, -1)
}

Universe.prototype.delay_if_game_over = function(milliseconds, callback) {
    if (this.game_over)
        setTimeout(callback, milliseconds)
    else
        callback()
}

var universe = new Universe()

universe.clade({name: 'human', symbol: '人', lean_mass: 10, attack: 'punch'})
universe.clade({name: 'samurai', symbol: '侍', lean_mass: 10, attack: 'cut', damage: 3})
universe.clade({name: 'blue dragon', symbol: '龍', lean_mass: 200, vigor: 20, attack: 'burn', damage: 9})
universe.clade({name: 'cat', symbol: '猫', lean_mass: 1, vigor: .2, attack: 'scratch'})
universe.clade({name: 'dog', symbol: '犬', lean_mass: 3, vigor: .5, attack: 'bite'})
universe.product({name: 'bokutō', symbol: '刀', action: 'toggle_wield', damage: function() { return {'hit': 2} }})
universe.product({name: 'katana', symbol: '刀', action: 'toggle_wield', damage: function() { return {'cut': 5} }})
universe.product({name: 'longsword', symbol: '剣', action: 'toggle_wield', damage: function() { return {'cut': 5} }})
universe.product({name: 'meat', symbol: '肉', fat: 2, action: 'eat', damage: function() { return {'slap': .5} }})
