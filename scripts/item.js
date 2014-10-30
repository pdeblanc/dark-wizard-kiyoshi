ITEM_STATS = ['mass', 'fat']

function Item(attributes) {
    WorldObject.apply(this, arguments)
    this.compile_attributes = function() {
        // appearance
        this.symbol = this.family.symbol
        this.span.className = 'item ' + this.family.name
        this.span.textContent = this.symbol
        this.span.item = this
        for (var i = 0; i < ITEM_STATS.length; i++) {
            var stat = ITEM_STATS[i]
            this[stat] = 1
            for (var j = 0; j < this.aspects.length; j++) {
                this[stat] *= (stat in this.aspects[j]) ? this.aspects[j][stat] : 1
            }
        }
    }

    // basic attributes
    this.family = attributes.family
    this.aspects = [this.family]
    this.aspects.push.apply(attributes.aspects || [])

    // highly mutable attributes
    this.square = attributes.square

    // setup
    this.span = document.createElement('span')
    if (this.square)
        this.square.enter(this)

    // compile attributes
    this.compile_attributes()
}

Item.prototype = Object.create(WorldObject.prototype)

Item.prototype.moveto = function(square) {
    if (square.permit_entry(this)) {
        if (this.square)
            this.square.exit(this)
        this.square = square
        this.square.enter(this)
    }
}

Item.prototype.destroy = function() {
    this.square.exit(this)
}

Item.prototype.default_action = function() {
    return this.family.action
}

Item.prototype.damage = function() {
    if (this.family.damage)
        return this.family.damage()
    return {'bash': 1}
}
