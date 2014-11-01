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
    var variant = Item.variant(attributes)
    this.products[variant.prototype.common_name] = variant
    return variant
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

