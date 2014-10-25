function WorldObject(attributes) {
    this.titlec = function() {
        var title = this.title()
        return title.charAt(0).toUpperCase() + title.slice(1)
    }

    this.title = function() {
        return "the " + this.family.name
    }
}
