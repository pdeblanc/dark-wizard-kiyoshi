function WorldObject(attributes) {
    this.A = function() {
        var title = this.a()
        return title.charAt(0).toUpperCase() + title.slice(1)
    }

    this.The = function() {
        var title = this.the()
        return title.charAt(0).toUpperCase() + title.slice(1)
    }

    this.a = function() {
        return "a " + this.family.name
    }

    this.the = function() {
        return "the " + this.family.name
    }
}
