function InventoryPlane(attributes) {
    Plane.apply(this, arguments)
}

InventoryPlane.prototype = Object.create(Plane.prototype)
InventoryPlane.prototype.labels = []
InventoryPlane.prototype.label_symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

InventoryPlane.prototype.generate_square = function(coordinate) {
    if (coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < this.width && coordinate.y < this.height)
        return universe.biomes['inventory slot'].create({plane: this, coordinate: coordinate})
    return universe.biomes.void.create({plane: this, coordinate: coordinate})
}

InventoryPlane.prototype.hide_labels = function() {
    for (var i = 0; i < this.labels.length; i++) {
        //this.labels[i].parentNode.removeChild(this.labels[i])
    }
    this.labels = []
}

InventoryPlane.prototype.show_labels = function(subject, action, dobj) {
    this.hide_labels()
    for (var i = 0; i < this.width * this.height; i++) {
        var coordinate = new Coordinate({y: Math.floor(i / this.width), x: i % this.width})
        var square = this.square(coordinate)
        if (dobj && action.select_iobj(subject, dobj, square) || !dobj && action.select_dobj(subject, square)) {
            var label = document.createElement('div')
            label.innerHTML = this.label_symbols[i]
            label.className = 'inventory-label'
            //square.span.appendChild(label)
            this.labels.push(label)
        }
    }
}

InventoryPlane.prototype.get_by_label = function(label) {
    var i = this.label_symbols.indexOf(label)
    if (i > -1 && i < this.width * this.height)
        return this.square(new Coordinate({y: Math.floor(i / this.width), x: i % this.width}))
    return false
}

InventoryPlane.prototype.render = function() {
    for (var i = 0; i < this.width * this.height; i++) {
        var coordinate = new Coordinate({y: Math.floor(i / this.width), x: i % this.width})
        var square = this.square(coordinate)
        $(square.span).removeClass('wielded')
        if (square.items.length && square.items[0].wielded_by)
            $(square.span).addClass('wielded')
    }
}
