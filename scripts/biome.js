function Biome(attributes) {
    this.name = attributes.name
    this.symbol = attributes.symbol
    this.tags = attributes.tags || []
    this.bias = attributes.bias || 0
    this.max_items = ('max_items' in attributes) ? attributes.max_items : 16;
    this.passable = ('passable' in attributes) ? attributes.passable : 1;
    this.affinity = function(other) {
        var total = 0;
        for (var i = 0; i < this.tags.length; i++) {
            for (var j = 0; j < other.tags.length; j++) {
                total += universe.affinity.get(this.tags[i], other.tags[j])
            }
        }
        return total;
    }
    var name_components = this.name.split(" ")
    for (var i = 0; i < name_components.length; i++) {
        if (this.tags.indexOf(name_components[i]) == -1)
            this.tags.push(name_components[i])
    }
}
