function Product(attributes) {
    this.attributes = Object.create(attributes)
    this.name = 'item'
    this.symbol = '品'
    this.fat = 0
    this.mass = 1
    this.universe = attributes.universe
    for (key in attributes) {
        this[key] = attributes[key]
    }
    this.universe.products[this.name] = this
}

Product.prototype.create = function() {
    return new Item({family: this, universe: this.universe})
}

Product.prototype.variant = function(attributes) {
    new Product($.extend({}, this.attributes, attributes))
    return this
}
