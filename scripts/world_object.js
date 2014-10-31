function WorldObject(attributes) {
    this.universe = attributes.universe
}

WorldObject.prototype.A = function() {
    return english.capitalize(this.a())
}

WorldObject.prototype.The = function() {
    return english.capitalize(this.the())
}

WorldObject.prototype.toString = WorldObject.prototype.a = function() {
    if (this.name)
        return this.name
    if (this.family.continuous)
        return this.family.name
    if ("aeiouAEIOU".indexOf(this.family.name.charAt(0)) > -1)
        return "an " + this.family.name
    return "a " + this.family.name
}

WorldObject.prototype.the = function() {
    if (this.name)
        return this.name
    return "the " + this.family.name
}
