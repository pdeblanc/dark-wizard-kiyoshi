function Product(attributes) {
    this.name = 'item'
    this.symbol = '品'
    for (key in attributes) {
        this[key] = attributes[key]
    }

    this.create = function() {
        return new Item({family: this})
    }
}

