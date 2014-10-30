function Clade(attributes) {
    this.name = 'being'
    this.symbol = '居'
    this.universe = attributes.universe
    this.attack = 'hit'
    this.damage = 1
    for (key in attributes) {
        this[key] = attributes[key]
    }
}

Clade.prototype.create = function() {
    return new Being({family: this, universe: this.universe})
}

