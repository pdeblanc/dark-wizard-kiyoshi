function WorldObject(attributes) {
    this.universe = attributes.universe
    this.A = function() {
        return english.capitalize(this.a())
    }

    this.The = function() {
        return english.capitalize(this.the())
    }

    this.a = function() {
        return "a " + this.family.name
    }

    this.the = function() {
        return "the " + this.family.name
    }
}
