function Clade(attributes) {
    this.name = 'being'
    this.symbol = '居'
    for (key in attributes) {
        this[key] = attributes[key]
    }

    this.create = function() {
        return new Being({family: this})
    }
}

