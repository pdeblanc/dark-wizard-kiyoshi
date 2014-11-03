actions = {}

Action = WorldObject.variant({}, function() {})

// action.execute(subject, direct_object, indirect_object)
// return true if action is successful
// return false if action is unsuccessful
// return a number 0 < x < 1 if the action is in progress; the same action will be repeated next turn (not implemented)
Action.prototype.execute = function() {
    return false
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

actions.moveto_or_attack = new Action({name: 'moveto_or_attack', dobj: Square})
actions.moveto_or_attack.execute = function(subject, square) {
    return (subject.moveto(square) || actions.attack.execute(subject, square))
}

actions.wait = new Action({name: 'wait'})
actions.wait.execute = function(subject) {
    subject.tell("You wait.")
    return true
}

actions.put = new Action({name: 'put', dobj: Item, iobj: Square})
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

actions.eat = new Action({name: 'eat', dobj: Square})
actions.eat.execute = function(subject, square) {
    if (square.items.length == 0) {
        subject.tell("There is nothing there to eat.")
        return;
    }
    var item = square.items[0]
    if (!(item.fat)) {
        subject.tell(item.The() + " does not appear to be edible.")
        return false;
    }
    subject.tell("You eat " + item.the() + ".")
    subject.body_fat += item.fat
    item.destroy()
    return true;
}

actions.drink = new Action({name: 'drink', dobj: Square})
actions.drink.execute = function(subject, square) {
    var target = square;
    for (var i = 0; i < square.items.length; i++) {
        if (square.items[i].drinkable || !target.drinkable)
            target = square.items[i]
    }
    for (var i = 0; i < square.beings.length; i++) {
        if (square.beings[i].drinkable || !target.drinkable)
            target = square.beings[i]
    }
    if (!(target.drinkable)) {
        subject.tell(target.The() + " does not appear to be drinkable.")
        return false;
    }
    subject.tell("You drink " + target.the() + ". That tasted good.")
    if (target instanceof Item)
        target.destroy()
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

actions.toggle_wield = new Action({name: 'toggle_wield', dobj: Square})
actions.toggle_wield.execute = function(subject, square) {
    if (square.items.length == 0) {
        subject.tell("There is nothing there to wield.")
        return;
    }
    var item = square.items[0]
    if (subject.wielding == item)
        return actions.unwield.execute(subject, square)
    else
        return actions.wield.execute(subject, square)
}

actions.wield = new Action({name: 'wield', dobj: Square})
actions.wield.execute = function(subject, square) {
    if (square.items.length == 0) {
        subject.tell("There is nothing there to wield.")
        return;
    }
    var item = square.items[0]
    if (subject.wielding)
        $(subject.wielding.span).removeClass('wielded')
    subject.wielding = item
    item.wielded_by = subject
    item.span.className += ' wielded'
    subject.tell('Now wielding ' + item.the() + '.')
    return true
}

actions.unwield = new Action({name: 'unwield', dobj: Square})
actions.unwield.execute = function(subject, square) {
    if (subject.wielding) {
        $(subject.wielding.span).removeClass('wielded')
        subject.wielding.wielded_by = false
    }
    subject.wielding = false
    subject.tell('Now wielding nothing.')
    return true
}
