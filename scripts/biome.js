function Biome(attributes) {
    this.name = attributes.name
    this.symbol = attributes.symbol
    this.max_items = ('max_items' in attributes) ? attributes.max_items : 16;
    this.passable = ('passable' in attributes) ? attributes.passable : 1;
}

