function Species(attributes) {
    this.name = 'being'
    this.symbol = '居'
    for (key in attributes) {
        this[key] = attributes[key]
    }
}

