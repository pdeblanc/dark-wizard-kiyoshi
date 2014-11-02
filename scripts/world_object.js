function WorldObject(attributes) {
    if (attributes)
        for (key in attributes)
            this[key] = attributes[key]
}

WorldObject.prototype.common_name = 'object'
WorldObject.prototype.continuous = false

WorldObject.prototype.constructor = WorldObject

WorldObject.prototype.A = function() {
    return english.capitalize(this.a())
}

WorldObject.prototype.The = function() {
    return english.capitalize(this.the())
}

WorldObject.prototype.toString = WorldObject.prototype.a = function() {
    if (this.proper_name)
        return this.proper_name
    if (this.continuous)
        return this.common_name
    if ("aeiouAEIOU".indexOf(this.common_name.charAt(0)) > -1)
        return "an " + this.common_name
    return "a " + this.common_name
}

WorldObject.prototype.the = function() {
    if (this.proper_name)
        return this.proper_name
    return "the " + this.common_name
}

WorldObject.set_name = 'classes'

WorldObject.variant = function(attributes, f) {
    var constructor = this
    function F() {
        constructor.apply(this, arguments)
        if (f)
            f.apply(this, arguments)
    }
    F.prototype = Object.create(constructor.prototype)
    for (key in attributes)
        F.prototype[key] = attributes[key]
    F.variant = this.variant
    F.set_name = this.set_name
    F.create = this.create
    if ('common_name' in attributes)
        universe[this.set_name][attributes.common_name] = F
    return F
}

WorldObject.create = function(attributes) {
    return new this(attributes)
}
