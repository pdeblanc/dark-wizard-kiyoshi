function Coordinate(attributes) {
    this.x = attributes.x
    this.y = attributes.y
    this.add = function(attributes) {
        x = this.x;
        y = this.y;
        if ('x' in attributes)
            x += attributes.x
        if ('y' in attributes)
            y += attributes.y
        return new Coordinate({x: x, y: y})
    }
}

