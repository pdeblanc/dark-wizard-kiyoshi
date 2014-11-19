ScalarAttribute = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
})

ScalarAttribute.prototype.base = 10
ScalarAttribute.prototype.current = ScalarAttribute.prototype.toString = function() {
    return this.base
}

