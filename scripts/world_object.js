function WorldObject(attributes) {
    this.universe = attributes.universe
    this.A = function() {
        return english.capitalize(this.a())
    }

    this.The = function() {
        return english.capitalize(this.the())
    }

    this.toString = this.a = function() {
        if (this.name)
            return this.name
        return "a " + this.family.name
    }

    this.the = function() {
        if (this.name)
            return this.name
        return "the " + this.family.name
    }
}
