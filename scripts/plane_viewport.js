function PlaneViewport(attributes) {
    this.controller = attributes.controller
    this.plane = attributes.plane
    this.name = ('' + Math.random()).substring(3)
    var container = attributes.container
    for (var y = 0; y < this.plane.height; y++) {
        var row = $("<div />").addClass("row")
        $(container).append(row)
        for (var x = 0; x < this.plane.width; x++) {
            row.append(viewportCell("_" + this.name + "_" + x + "_" + y, this.controller))
        }
    }
    this.render()
}

PlaneViewport.prototype.render = function() {
    for (var x = 0; x < this.plane.width; x++) {
        for (var y = 0; y < this.plane.height; y++) {
            var cell = $('#_' + this.name + '_' + x + '_' + y)
            var square = this.plane.square(new Coordinate({x: x, y: y}))
            square.blit(this.controller.being, cell)
        }
    }
}
