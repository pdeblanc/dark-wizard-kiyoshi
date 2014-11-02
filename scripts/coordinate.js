function Coordinate(attributes) {
    this.x = attributes.x
    this.y = attributes.y
}

Coordinate.prototype.add = function(attributes) {
    x = this.x;
    y = this.y;
    if ('x' in attributes)
        x += attributes.x
    if ('y' in attributes)
        y += attributes.y
    return new Coordinate({x: x, y: y})
}

Coordinate.prototype.lattice_parents = function() {
    var divisor = 1
    while (!(this.x % (2 * divisor) || this.y % (2 * divisor))) {
        divisor *= 2
    }
    if ((this.x + this.y) % (2 * divisor))
        return [this.add({x: 0, y: -divisor}), this.add({x: 0, y: divisor}), this.add({x: -divisor, y: 0}), this.add({x: divisor, y: 0})]
    return [this.add({x: -divisor, y: -divisor}), this.add({x: -divisor, y: divisor}), this.add({x: divisor, y: -divisor}), this.add({x: divisor, y: divisor})]
}
