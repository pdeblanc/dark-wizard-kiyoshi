function Product(attributes) {
    this.name = 'item'
    this.symbol = '品'
    this.universe = attributes.universe
    for (key in attributes) {
        this[key] = attributes[key]
    }

    this.create = function() {
        return new Item({family: this, universe: this.universe})
    }
}

