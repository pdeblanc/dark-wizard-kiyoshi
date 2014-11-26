// random effects of magical tea
effects = {}

Effect = WorldObject.variant({}, function() {})
Effect.prototype.level = 0 // this will be added to the level of the Item class for things like tea

// return true if the being can understand the effects of the magical tea
Effect.prototype.execute = function(being) {
    return false
}

effects.healing = new Effect({name: 'healing', level: 3})
effects.healing.execute = function(being) {
    if (being.health >= 1) {
        being.tell("That tasted good.")
        return false
    }
    being.health = 1
    being.tell("You are completely healed.")
    return true
}

effects.poison = new Effect({name: 'poison'})
effects.poison.execute = function(being) {
    being.health -= 2 / being.vigor.current()
    being.tell("You don't feel so good.")
    return true
}

effects.empowerment = new Effect({name: 'empowerment', level: 1})
effects.empowerment.execute = function(being) {
    being.add_condition(universe.conditions.empowerment.create())
        this.conditions = {}
    return true
}

effects.invigoration = new Effect({name: 'invigoration', level: 1})
effects.invigoration.execute = function(being) {
    being.add_condition(universe.conditions.invigoration.create())
        this.conditions = {}
    return true
}

effects.acceleration = new Effect({name: 'acceleration', level: 2})
effects.acceleration.execute = function(being) {
    being.add_condition(universe.conditions.acceleration.create())
        this.conditions = {}
    return true
}

effects.xray_vision = new Effect({name: 'X-ray vision', level: 1})
effects.xray_vision.execute = function(being) {
    being.add_condition(universe.conditions.xray_vision.create())
        this.conditions = {}
    return true
}

