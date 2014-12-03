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

Coordinate.prototype.max_distance = function(other) {
    return Math.max(Math.abs(other.x - this.x), Math.abs(other.y - this.y))
}

Coordinate.prototype.taxicab_distance = function(other) {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y)
}

Coordinate.prototype.euclidean_distance = function(other, z_offset) {
    return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2) + z_offset * z_offset)
}

Coordinate.prototype.line = function(other) {
    // Construct a line segment from the center of this to the center of other;
    // return an array of [coordinate, length] pairs, where length is the length
    // of the line segment intersecting the square centered at coordinate
    var total_distance = Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2))
    var x_offset = other.x - this.x
    var y_offset = other.y - this.y
    var x_direction = (x_offset > 0) * 2 - 1
    var y_direction = (y_offset > 0) * 2 - 1
    var x_speed = Math.abs(x_offset / total_distance)   // suppose we are moving at speed 1 overall
    var y_speed = Math.abs(y_offset / total_distance)
    var time_until_x_step = .5 / x_speed
    var time_until_y_step = .5 / y_speed
    var x = this.x;
    var y = this.y;
    var pairs = []
    while (x != other.x || y != other.y) {
        var time_step = Math.min(time_until_y_step, time_until_x_step)
        pairs.push([new Coordinate({x: x, y: y}), time_step])
        time_until_x_step -= time_step
        time_until_y_step -= time_step
        if (time_until_x_step == 0) {
            x += x_direction
            time_until_x_step = 1 / x_speed
        }
        if (time_until_y_step == 0) {
            y += y_direction
            time_until_y_step = 1 / y_speed
        }
    }
    if (pairs.length)
        pairs.push([other, pairs[0][1]])
    return pairs
}

Coordinate.prototype.seed = function() {
    return Probability.hash_int(this.x + Probability.hash_int(this.y))
}

Coordinate.prototype.serialize = function() {
    return {x: this.x, y: this.y}
}
