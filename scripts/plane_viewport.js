function PlaneViewport(attributes) {
    this.being = attributes.being
    this.plane = attributes.plane
    this.name = ('' + Math.random()).substring(3)
    for (var y = 0; y < this.plane.height; y++) {
        var row = $("<div />").addClass("row")
        $("#inventory").append(row)
        for (var x = 0; x < this.plane.width; x++) {
            row.append(viewportCell("_" + this.name + "_" + x + "_" + y, this.being))
        }
    }
    this.render = function() {
        for (var x = 0; x < this.plane.width; x++) {
            for (var y = 0; y < this.plane.height; y++) {
                var square = this.plane.square(new Coordinate({x: x, y: y}))
                $('#_' + this.name + '_' + x + '_' + y).html('').append(square.span)
            }
        }
    }
    this.render()
}

