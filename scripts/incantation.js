Incantation = WorldObject.variant({name: 'incantation'})

incantations = {}

Incantation.prototype.match = function(other) {
    if (this.name.toLowerCase() == other.name.toLowerCase())
        return true
    return false
}

Incantation.prototype.execute = function(subject) {
    subject.tell("Nothing happens.")
    return true
}

incantations.power = new Incantation({name: 'chikara'})
incantations.power.execute = function(subject) {
    subject.add_condition(universe.conditions.empowerment.create())
    return true
}

