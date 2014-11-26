Item = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    this.foreground = document.createElement('span')
    if (this.square)
        this.square.enter(this)
    this.foreground.className = this.className
    this.foreground.textContent = this.symbol
    this.foreground = centralizer(this.foreground).addClass('item')
    this.foreground[0].item = this
    $(this.foreground).draggable({opacity: 0.7, helper: "clone", zIndex: 1000})
})

Item.set_name = 'products'

Item.prototype = Object.create(WorldObject.prototype)

Item.prototype.name = 'item'

Item.prototype.fat = 0
Item.prototype.drinkable = false
Item.prototype.weight = 1

Item.prototype.moveto = function(square) {
    if (square.permit_entry(this)) {
        if (this.square)
            this.square.exit(this)
        this.square = square
        this.square.enter(this)
        this.check_wielding()
        return true
    }
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

Item.variant = function(attributes, f) {
    var F = WorldObject.variant.apply(this, arguments)
    var proto = F.prototype
    if (proto.random_effects && proto.random_effects.length && !proto.generic) {
        var i = Math.floor(Math.random() * proto.random_effects.length)
        proto.effect = proto.random_effects[i]
        proto.level += proto.effect.level
        proto.random_effects.splice(i, 1)
    }
    return F
}
