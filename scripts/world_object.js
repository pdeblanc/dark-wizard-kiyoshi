generate_id = function() {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
}

function WorldObject(attributes) {
    this.id = generate_id()
    if (attributes)
        for (key in attributes)
            this[key] = attributes[key]
}

WorldObject.prototype.name = 'object'
WorldObject.prototype.continuous = false // continuous objects will not be referenced with an indefinite article
WorldObject.prototype.habitat = {}
WorldObject.prototype.bias = -5 // the higher the number, the more common this object class will be
WorldObject.prototype.level = 1
WorldObject.prototype.attacks = []

WorldObject.prototype.constructor = WorldObject

WorldObject.prototype.A = function(observer) {
    return english.capitalize(this.a(observer))
}

WorldObject.prototype.The = function(observer) {
    return english.capitalize(this.the(observer))
}

WorldObject.prototype.toString = WorldObject.prototype.a = function(observer) {
    if (this.continuous || this.name != this.__proto__.name)
        return this.name
    if ("aeiouAEIOU".indexOf(this.name.charAt(0)) > -1)
        return "an " + this.name + this.suffix(observer)
    return "a " + this.name + this.suffix(observer)
}

WorldObject.prototype.the = function(observer) {
    if (this.name != this.__proto__.name)
        return this.name
    return "the " + this.name + this.suffix(observer)
}

WorldObject.prototype.suffix = function(observer) {
    if (!observer || !this.effect || !observer.knowledge[this.class_id])
        return ""
    return " of " + this.effect.name
}

WorldObject.prototype.weapon_quality = function(observer) {
    var quality = 0
    if (this.attacks) {
        for (var i = 0; i < this.attacks.length; i++) {
            var attack = this.attacks[i].create({attacker: observer, target: observer, weapon: this})
            quality = Math.max(quality, attack.damage)
        }
    }
    return quality
}

WorldObject.weird_heritable_stuff = ['weird_heritable_stuff', 'specificity', 'set_name', 'variant', 'create', 'variant_of_given_specificity', 'kingdom', 'phylum', 'clazz', 'order', 'family', 'genus', 'species']

WorldObject.specificity = -100 // more abstract classes have lower specificity

WorldObject.set_name = 'classes'

WorldObject.variant = function(attributes, f) {
    var constructor = this
    function F() {
        constructor.apply(this, arguments)
        if (f)
            f.apply(this, arguments)
    }
    F.prototype = Object.create(constructor.prototype)
    F.specificity = this.specificity + 1
    F.parent_class = this
    F.prototype.generic = false
    F.prototype.class_id = generate_id()
    for (key in attributes)
        F.prototype[key] = attributes[key]
    F.prototype.className = F.prototype.name.replace(/ /g, '-')
    for (var i = 0; i < this.weird_heritable_stuff.length; i++)
        F[this.weird_heritable_stuff[i]] = this[this.weird_heritable_stuff[i]]
    if ('name' in attributes && !F.prototype.generic)
        universe[this.set_name][attributes.name] = F
    return F
}

WorldObject.variant_of_given_specificity = function(attributes, f, specificity) {
    var parentClass = this
    while (parentClass.specificity >= specificity)
        parentClass = parentClass.parent_class
    var result = parentClass.variant(attributes, f)
    result.specificity = specificity
    return result
}

WorldObject.kingdom = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 1)
}

WorldObject.kingdom = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 1)
}

WorldObject.phylum = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 2)
}

WorldObject.clazz = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 3)
}

WorldObject.order = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 4)
}

WorldObject.family = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 5)
}

WorldObject.genus = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 6)
}

WorldObject.species = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 7)
}

WorldObject.create = function(attributes) {
    return new this(attributes)
}

