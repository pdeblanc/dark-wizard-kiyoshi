actions = {}

Action = WorldObject.variant({}, function() {})

// action.execute(subject, direct_object, indirect_object)
// return true if action is successful
// return false if action is unsuccessful
// return a number 0 < x < 1 if the action is in progress; the same action will be repeated next turn (not implemented)
Action.prototype.execute = function() {
    return false
}

// return a square, item, or being within the given square that is a valid target for this action.
// If no valid target is available, return a string explaining why, or return false.
Action.prototype.select_dobj = function(subject, square) {
    if (this.dobj == Square && this.accept_dobj(subject, square) == true)
        return square
    if (this.dobj == Being && square.beings.length && this.accept_dobj(subject, square.beings[0]) == true)
        return square.beings[0]
    if (this.dobj == Item && square.items.length && this.accept_dobj(subject, square.items[0]) == true)
        return square.items[0]
    return false
}

// return a square, item, or being within the given square that is a valid indirect target for this action.
// If no valid indirect target is available, return a string explaining why, or return false.
Action.prototype.select_iobj = function(subject, dobj, square) {
    if (this.iobj == Square && this.accept_iobj(subject, dobj, square) == true)
        return square
    if (this.iobj == Being && square.beings.length && this.accept_iobj(subject, dobj, square.beings[0]) == true)
        return square.beings[0]
    if (this.iobj == Item && square.items.length && this.accept_iobj(subject, dobj, square.items[0]) == true)
        return square.items[0]
    return false
}

// return true if dobj is acceptable.
// otherwise, return a string explaining why, or return false.
Action.prototype.accept_dobj = function(subject, dobj) {
    return true
}

Action.prototype.accept_iobj = function(subject, dobj, iobj) {
    return true
}

actions.north = new Action({name: 'north'})
actions.north.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.north())
}

actions.south = new Action({name: 'south'})
actions.south.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.south())
}

actions.east = new Action({name: 'east'})
actions.east.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.east())
}

actions.west = new Action({name: 'west'})
actions.west.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.west())
}

actions.descend = new Action({name: 'descend'})
actions.descend.execute = function(subject) {
    if (subject.square.can_descend)
        return actions.moveto_or_attack.execute(subject, subject.square.plane.downstairs.square(subject.square.coordinate))
    subject.tell("You see no way down from here.")
}

actions.ascend = new Action({name: 'ascend'})
actions.ascend.execute = function(subject) {
    if (subject.square.can_ascend)
        return actions.moveto_or_attack.execute(subject, subject.square.plane.upstairs.square(subject.square.coordinate))
    subject.tell("You see no way up from here.")
}

actions.moveto_or_attack = new Action({name: 'moveto_or_attack', dobj: Square})
actions.moveto_or_attack.execute = function(subject, square) {
    return (subject.moveto(square) || actions.attack.execute(subject, square))
}

actions.wait = new Action({name: 'wait'})
actions.wait.execute = function(subject) {
    subject.tell("You wait.")
    return true
}

actions.put = new Action({name: 'put', dobj: Item, iobj: Square, prep: 'into'})
actions.put.accept_iobj = function(subject, item, square) {
    return square.permit_entry(item)
}
actions.put.execute = function(subject, item, square) {
    var success = item.moveto(square)
    if (success)
        subject.tell("You put " + item.the() + " into " + square.the() + ".")
    return success
}

actions.rest = new Action({name: 'rest'})
actions.rest.execute = function(subject) {
    if (subject.health >= 1) {
        subject.tell("You are already fully healed!")
        return false;
    }
    subject.tell('You rest...')
    subject.health = Math.min(1, subject.health + 0.01)
    subject.redraw()
    return subject.health
}

actions.get = new Action({name: 'get'})
actions.get.execute = function(subject) {
    var gotten_items, item, vacancy
    gotten_items = []
    while ((item = subject.square.items[0]) && (vacancy = subject.inventory.vacancy(item))) {
        item.moveto(vacancy)
        gotten_items.push(item)
    }
    if (gotten_items.length) {
        subject.tell("You get " + english.list(gotten_items) + ".")
        return true
    }
    if (subject.square.items[0])
        subject.tell("You do not have space for " + subject.square.items[0].a() + ".")
    else
        subject.tell("There is nothing to get.")
    return false
}

actions.eat = new Action({name: 'eat', dobj: Item})
actions.eat.accept_dobj = function(subject, item) {
    return (item.fat > 0)
}
actions.eat.execute = function(subject, item) {
    subject.tell("You eat " + item.the() + ".")
    subject.body_fat += item.fat
    item.destroy()
    return true;
}

actions.drink = new Action({name: 'drink', dobj: Item})
actions.drink.accept_dobj = function(subject, item) {
    return (item.drinkable == true)
}
actions.drink.execute = function(subject, item) {
    subject.tell("You drink " + item.the() + ". That tasted good.")
    item.destroy()
    return true;
}

actions.look = new Action({name: 'look', dobj: Square})
actions.look.execute = function(subject, square) {
    var item_names = [square.a()]
    for (var i = 0; i < square.beings.length; i++)
        item_names.push(square.beings[i].a())
    for (var i = 0; i < square.items.length; i++)
        item_names.push(square.items[i].a())
    subject.tell('You see ' + english.list(item_names) + '.')
    return false
}

actions.attack = new Action({name: 'attack', dobj: Square})
actions.attack.execute = function(subject, target_square) {
    for (var i = 0; i < target_square.beings.length; i++) {
        var being = target_square.beings[i]
        if (subject.wielding) {
            being.receive_damage(subject.wielding.attack, subject)
        }
        else {
            var attack = subject.attacks[0]
            being.receive_damage(attack, subject)
        }
        return true
    }
    return false;
}

actions.toggle_wield = new Action({name: 'toggle_wield', dobj: Item})
actions.toggle_wield.execute = function(subject, item) {
    if (subject.wielding == item)
        return actions.unwield.execute(subject, item)
    else
        return actions.wield.execute(subject, item)
}

actions.wield = new Action({name: 'wield', dobj: Item})
actions.wield.execute = function(subject, item) {
    if (!subject.is_holding(item)) {
        var vacancy = subject.inventory.vacancy(item)
        if (!(vacancy && item.moveto(vacancy))) {
            subject.tell('Your inventory is full. Drop something first.')
            return false
        }
    }
    if (subject.wielding)
        $(subject.wielding.span).removeClass('wielded')
    subject.wielding = item
    item.wielded_by = subject
    item.span.className += ' wielded'
    subject.tell('Now wielding ' + item.a() + '.')
    return true
}

actions.unwield = new Action({name: 'unwield', dobj: Item})
actions.unwield.execute = function(subject, item) {
    if (subject.wielding) {
        $(subject.wielding.span).removeClass('wielded')
        subject.wielding.wielded_by = false
    }
    subject.wielding = false
    subject.tell('No longer wielding ' + item.the() + '.')
    return true
}
