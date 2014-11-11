Item = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    this.span = document.createElement('span')
    $(this.span).draggable({ opacity: 0.7, helper: "clone"})
    if (this.square)
        this.square.enter(this)
    this.span.className = 'being-or-item item ' + this.className
    this.span.textContent = this.symbol
    this.span.item = this
})

Item.set_name = 'products'

Item.prototype = Object.create(WorldObject.prototype)

Item.prototype.name = 'item'

Item.prototype.fat = 0
Item.prototype.drinkable = false
Item.prototype.weight = 1
Item.prototype.attack = {'hit': 1}

Item.prototype.moveto = function(square) {
    if (square.permit_entry(this)) {
        if (this.square)
            this.square.exit(this)
        this.square = square
        this.square.enter(this)
        $(this.span).draggable({ opacity: 0.7, helper: "clone"})
        this.check_wielding()
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

Item.prototype.check_wielding = function() {
    var subject
    if ((subject = this.wielded_by) && !(subject.is_holding(this)))
        actions.unwield.execute(subject, this)
}
