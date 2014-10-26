function Clade(attributes) {
    this.name = 'being'
    this.symbol = '居'
    this.universe = attributes.universe
    for (key in attributes) {
        this[key] = attributes[key]
    }

    this.create = function() {
        return new Being({family: this, universe: this.universe})
    }
}

