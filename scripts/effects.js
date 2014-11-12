// random effects of magical tea
effects = {}

Effect = WorldObject.variant({}, function() {})

// return true if the being can understand the effects of the magical tea
Effect.prototype.execute = function(being) {
    return false
}

effects.healing = new Effect({name: 'healing'})
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
    being.health -= 2 / being.vigor
    being.tell("You don't feel so good.")
    return true
}

