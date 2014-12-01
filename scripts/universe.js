function Universe(attributes) {
    this.clades = {}
    this.products = {}
    this.biomes = {}
    this.attacks = {}
    this.affinities = {}
    this.conditions = {}
    this.game_over = false
    this.players = {}
    this.timeline = new Timeline({start_time: 0, universe: this})
} 

Universe.prototype.simulate = function() {
    this.timeline.simulate()
}

Universe.prototype.biome = function(attributes) {
    attributes.universe = this
    return new Biome(attributes)
}

Universe.prototype.affinity = function(a, b, x) {
    if (x == undefined) {
        if (a in this.affinities && b in this.affinities[a])
            return this.affinities[a][b]
        return false
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

var universe = new Universe()

function values_by_sorted_keys(object) {
    var keys = Object.keys(object)
    keys.sort()
    var values = []
    for (var i = 0; i < keys.length; i++) {
        values.push(object[keys[i]])
    }
    return values
}
