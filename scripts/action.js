actions = {};

Action = WorldObject.variant({}, function() {});

// action.execute(subject, direct_object, indirect_object)
// return true if action is successful
// return false if action is unsuccessful
// return a number 0 < x < 1 if the action is in progress; the same action will be repeated next turn (not implemented)
Action.prototype.execute = function() {
    return false;
};

// return a square, item, or being within the given square that is a valid target for this action.
// If no valid target is available, return a string explaining why, or return false.
Action.prototype.select_dobj = function(subject, square) {
    var acceptance = false;
    if (this.dobj == Square && (acceptance = this.accept_dobj(subject, square)) === true)
        return square;
    if (this.dobj == Being && square.beings.length && (acceptance = this.accept_dobj(subject, square.beings[0])) === true)
        return square.beings[0];
    if (this.dobj == Item && square.items.length && (acceptance = this.accept_dobj(subject, square.items[0])) === true)
        return square.items[0];
    return acceptance;
};

// return a square, item, or being within the given square that is a valid indirect target for this action.
// If no valid indirect target is available, return a string explaining why, or return false.
Action.prototype.select_iobj = function(subject, dobj, square) {
    if (this.iobj == Square && this.accept_iobj(subject, dobj, square) === true)
        return square;
    if (this.iobj == Being && square.beings.length && this.accept_iobj(subject, dobj, square.beings[0]) === true)
        return square.beings[0];
    if (this.iobj == Item && square.items.length && this.accept_iobj(subject, dobj, square.items[0]) === true)
        return square.items[0];
    return false;
};

Action.prototype.accept_subject = function(subject) {
    return true;
};

// return true if dobj is acceptable.
// otherwise, return a string explaining why, or return false.
Action.prototype.accept_dobj = function(subject, dobj) {
    return true;
};

Action.prototype.accept_iobj = function(subject, dobj, iobj) {
    return true;
};

actions.north = new Action({name: 'north'});
actions.north.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.north());
};

actions.south = new Action({name: 'south'});
actions.south.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.south());
};

actions.east = new Action({name: 'east'});
actions.east.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.east());
};

actions.west = new Action({name: 'west'});
actions.west.execute = function(subject) {
    return actions.moveto_or_attack.execute(subject, subject.square.west());
};

actions.descend = new Action({name: 'descend'});
actions.descend.execute = function(subject) {
    if (subject.square.can_descend || (subject.square.plane.downstairs && subject.cheater))
        return actions.moveto_or_attack.execute(subject, subject.square.plane.downstairs.square(subject.square.coordinate));
    subject.tell("You see no way down from here.");
};

actions.ascend = new Action({name: 'ascend'});
actions.ascend.execute = function(subject) {
    if (subject.square.can_ascend || (subject.square.plane.upstairs && subject.cheater))
        return actions.moveto_or_attack.execute(subject, subject.square.plane.upstairs.square(subject.square.coordinate));
    subject.tell("You see no way up from here.");
};

actions.moveto_or_attack = new Action({name: 'moveto_or_attack', dobj: Square});
actions.moveto_or_attack.execute = function(subject, square) {
    return (subject.moveto(square) || actions.attack.execute(subject, square));
};

actions.wait = new Action({name: 'wait'});
actions.wait.execute = function(subject) {
    subject.tell("You wait.");
    return true;
};

actions.put = new Action({name: 'put', dobj: Item, iobj: Square, prep: 'into'});
actions.put.accept_iobj = function(subject, item, square) {
    return square.permit_entry(item);
};
actions.put.execute = function(subject, item, square) {
    var success = item.moveto(square);
    if (success)
        subject.tell("You put " + item.the(subject) + " into " + square.the(subject) + ".");
    return success;
};

actions.rest = new Action({name: 'rest'});
actions.rest.execute = function(subject) {
    if (subject.health >= 1 && subject.energy >= 1) {
        subject.tell("You are already fully healed!");
        return false;
    }
    var neighbors = subject.square.neighbors();
    var enemies = [];
    for (var direction in neighbors) {
        var beings = neighbors[direction].beings;
        for (var i = 0; i < beings.length; i++) {
            if (beings[i].hostile(subject))
                enemies.push(beings[i].the(subject));
        }
    }
    if (enemies.length) {
        subject.tell("You cannot rest next to " + english.list(enemies, subject) + ".");
        return false;
    }
    subject.tell('You rest...');
    subject.health = Math.min(1, subject.health + 0.01);
    subject.energy = Math.min(1, subject.energy + 0.01);
    subject.redraw();
    return Math.min(subject.health, subject.energy);
};

actions.get = new Action({name: 'get'});
actions.get.execute = function(subject) {
    actions.take._execute(subject, subject.square, "get");
};

actions.take = new Action({name: 'take', dobj: Square});
actions.take.accept_dobj = function(subject, square) {
    if (square.items.length === 0)
        return "There is nothing to take.";
    if (subject.inventory == square.plane)
        return "You are already holding " + english.list(square.items.map(function(item) { return item.the(subject); }), subject) + ".";
    if (!subject.can_reach(square))
        return "You cannot reach that far.";
    return true;
};
actions.take.execute = function(subject, square) {
    actions.take._execute(subject, square, "take");
};
actions.take._execute = function(subject, square, verb) {
    var gotten_items, item, vacancy, stacks, to_get, i, result;
    gotten_items = [];
    stacks = [];
    squares = [];
    to_get = square.items.slice(0);
    for (i = 0; i < to_get.length; i++) {
        result = subject.inventory.attempt_take(to_get[i]);
        if (result) {
            gotten_items.push(to_get[i]);
            if (result != to_get[i] && !(stacks.includes(result))) {
                stacks.push(result);
                if (!(squares.includes(result.square)))
                    squares.push(result.square);
            }
            else {
                if (!(squares.includes(to_get[i].square)))
                    squares.push(to_get[i].square);
            }
        }
    }
    if (gotten_items.length) {
        subject.tell("You " + verb + " " + english.list(gotten_items, subject) + ".");
        subject.square.announce_all_but([subject], subject.The() + " " + verb + "s " + english.list(gotten_items) + ".");
        if (stacks.length) {
            subject.tell("You now have " + english.list(stacks, subject) + ".");
        }
        for (i = 0; i < squares.length; i++) {
            squares[i].flash();
        }
        return true;
    }
    if (square.items.length)
        subject.tell("You do not have space for " + english.list(square.items, subject) + ".");
    else
        subject.tell("There is nothing to " + verb + ".");
    return false;
};


actions.drop = new Action({name: 'drop', dobj: Item});
actions.drop.accept_dobj = function(subject, item) {
    if (item.square.plane != subject.inventory)
        return "You are not holding " + item.the(subject) + ".";
    return true;
};
actions.drop.execute = function(subject, item) {
    var success = item.moveto(subject.square);
    if (success) {
        subject.tell("You drop " + item.the(subject) + " in " + subject.square.the(subject) + ".");
        subject.square.announce_all_but([subject], subject.The() + " drops " + item.a() + ".");
    }
    else
        subject.tell("There is no room for " + item.the(subject) + " in " + subject.square.the() + ".");
};


actions.eat = new Action({name: 'eat', dobj: Item});
actions.eat.accept_dobj = function(subject, item) {
    return (item.fat > 0);
};
actions.eat.execute = function(subject, item) {
    subject.tell("You eat " + item.the(subject) + ".", "eat");
    subject.square.announce_all_but([subject], subject.The() + ' eats ' + item.the() + '.');
    subject.body_fat += item.fat;
    item.destroy();
    return true;
};

actions.drink = new Action({name: 'drink', dobj: Item});
actions.drink.accept_dobj = function(subject, item) {
    return (item.drinkable === true);
};
actions.drink.execute = function(subject, item) {
    subject.tell("You drink " + item.the(subject) + ".", "drink");
    if (item.effect) {
        var discovery = item.effect.execute(subject);
        if (discovery && !subject.knowledge[item.class_id]) {
            subject.knowledge[item.class_id] = 1;
            subject.tell("It was " + item.a(subject) + ".");
        }
    }
    item.destroy();
    return true;
};

actions.look = new Action({name: 'look', dobj: Square});
actions.look.execute = function(subject, square) {
    var i;
    var item_names = [square.a(subject)];
    for (i = 0; i < square.beings.length; i++)
        item_names.push(square.beings[i].a(subject));
    for (i = 0; i < square.items.length; i++)
        item_names.push(square.items[i].a(subject));
    subject.tell('You see ' + english.list(item_names) + '.');
    return false;
};

actions.attack = new Action({name: 'attack', dobj: Square});
actions.attack.execute = function(subject, target_square) {
    var to_hit_bonus = Probability.gauss();
    var damage_bonus = Probability.gauss();
    for (var i = 0; i < target_square.beings.length; i++) {
        var being = target_square.beings[i];
        var attacks = [];
        for (var j = 0; j < subject.attacks.length; j++) {
            attacks.push(subject.attacks[j].create({attacker: subject, target: being, to_hit_bonus: to_hit_bonus, damage_bonus: damage_bonus}));
        }
        if (subject.wielding) {
            for (var k = 0; k < subject.wielding.attacks.length; k++) {
                attacks.push(subject.wielding.attacks[k].create({attacker: subject, target: being, weapon: subject.wielding, to_hit_bonus: to_hit_bonus, damage_bonus: damage_bonus}));
            }
        }
        var best_attack = false;
        var best_damage = 0;
        for (var l = 0; l < attacks.length; l++) {
            //subject.tell("Possible attack: " + attacks[i].a() + " for " + attacks[i].damage + " damage.")
            if (attacks[l].damage > best_damage || !best_attack) {
                best_attack = attacks[l];
                best_damage = attacks[l].damage;
            }
        }
        if (best_attack) {
            best_attack.execute();
            if (being.dead)
                subject.gain_experience(being.level);
            return true;
        }
    }
    return false;
};

actions.toggle_wield = new Action({name: 'toggle_wield', dobj: Item});
actions.toggle_wield.execute = function(subject, item) {
    if (subject.wielding == item)
        return actions.unwield.execute(subject, item);
    else
        return actions.wield.execute(subject, item);
};

actions.wield = new Action({name: 'wield', dobj: Item});
actions.wield.execute = function(subject, item) {
    if (!subject.hands) {
        subject.tell("You cannot wield anything because you do not have hands.");
        return false;
    }
    if (!subject.is_holding(item)) {
        var vacancy = subject.inventory.vacancy(item);
        if (!(vacancy && item.moveto(vacancy))) {
            subject.tell('Your inventory is full. Drop something first.');
            return false;
        }
    }
    if (subject.wielding)
        subject.wielding.wielded_by = false;
    subject.wielding = item;
    item.wielded_by = subject;
    subject.tell('You wield ' + item.the(subject) + '.');
    subject.square.announce_all_but([subject], subject.The() + ' wields ' + item.the() + '.');
    return true;
};

actions.unwield = new Action({name: 'unwield', dobj: Item});
actions.unwield.execute = function(subject, item) {
    if (subject.wielding)
        subject.wielding.wielded_by = false;
    subject.wielding = false;
    subject.tell('No longer wielding ' + item.the(subject) + '.');
    return true;
};

actions.magic = new Action({name: 'magic', dobj: Incantation});
actions.magic.accept_subject = function(subject) {
    if (subject.energy * subject.magic < 1)
        return "You do not have enough spell energy to use magic.";
    return true;
};
actions.magic.execute = function(subject, incantation) {
    subject.tell('You chant, "' + incantation.name + '"');
    subject.energy -= 1 / subject.magic;
    for (var key in incantations) {
        var spell = incantations[key];
        if (spell.match(incantation)) {
            return spell.execute(subject);
        }
    }
    return incantation.execute(subject);
};

actions.read = new Action({name: 'read', dobj: Item});
actions.read.accept_dobj = function(subject, dobj) {
    return (dobj.text && dobj.text.length > 0);
};
actions.read.execute = function(subject, item) {
    top.thing = item;
    var lines = item.text.split("\n");
    subject.tell("You begin reading " + item.the() + ".", "turn-page");
    for (var i = 0; i < lines.length; i++) {
        subject.tell("\xA0" + lines[i]);
    }
    subject.tell("You have finished reading " + item.the() + ".");
    return true;
};
