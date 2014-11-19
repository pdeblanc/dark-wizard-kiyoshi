ScalarAttribute = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
})

ScalarAttribute.prototype.base = 10
ScalarAttribute.prototype.current = ScalarAttribute.prototype.toString = function() {
    var value = this.base
    for (var key in this.being.conditions) {
        var cond = this.being.conditions[key]
        if (cond[this.name + '_bonus'])
            value += cond[this.name + '_bonus']
    }
    return value
}

