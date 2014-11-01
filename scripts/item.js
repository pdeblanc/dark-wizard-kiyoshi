ITEM_STATS = ['mass', 'fat']

Item = WorldObject.variant({}, function(attributes) {
    if (!attributes)
        attributes = {}
    this.compile_attributes = function() {
        // appearance
        this.span.className = 'item ' + this.common_name
        this.span.textContent = this.symbol
        this.span.item = this
    }

    // highly mutable attributes
    this.square = attributes.square

    // setup
    this.span = document.createElement('span')
    $(this.span).draggable({ opacity: 0.7, helper: "clone"})
    if (this.square)
        this.square.enter(this)

    // compile attributes
    this.compile_attributes()
})

Item.set_name = 'products'

Item.prototype = Object.create(WorldObject.prototype)

Item.prototype.moveto = function(square) {
    if (square.permit_entry(this)) {
        if (this.square)
            this.square.exit(this)
        this.square = square
        this.square.enter(this)
        $(this.span).draggable({ opacity: 0.7, helper: "clone"})
        return true
    }
    $(this.span).draggable({ opacity: 0.7, helper: "clone"})
    return false
}

Item.prototype.destroy = function() {
    this.square.exit(this)
    if (this.wielded_by)
        this.wielded_by.wielding = false
}

Item.prototype.default_action = function() {
    return this.action
}

