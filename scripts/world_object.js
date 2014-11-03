function WorldObject(attributes) {
    this.id = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    if (attributes)
        for (key in attributes)
            this[key] = attributes[key]
}

WorldObject.prototype.name = 'object'
WorldObject.prototype.continuous = false

WorldObject.prototype.constructor = WorldObject

WorldObject.prototype.A = function() {
    return english.capitalize(this.a())
}

WorldObject.prototype.The = function() {
    return english.capitalize(this.the())
}

WorldObject.prototype.toString = WorldObject.prototype.a = function() {
    if (this.continuous || this.name != this.__proto__.name)
        return this.name
    if ("aeiouAEIOU".indexOf(this.name.charAt(0)) > -1)
        return "an " + this.name
    return "a " + this.name
}

WorldObject.prototype.the = function() {
    if (this.name != this.__proto__.name)
        return this.name
    return "the " + this.name
}

WorldObject.set_name = 'classes'

WorldObject.initialize_class = function() { }

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
    if ('name' in attributes)
        universe[this.set_name][attributes.name] = F
    return F
}

WorldObject.create = function(attributes) {
    return new this(attributes)
}
