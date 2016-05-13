Being = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments);
    for (var i = 0; i < this.scalar_attributes.length; i++) {
        var attribute = this.scalar_attributes[i];
        this[attribute] = new ScalarAttribute({base: this[attribute], being: this, name: attribute});
    }
    // graphics
    this.skin = $('<div />').addClass(this.className).text(this.symbol).addClass('skin');
    this.blood = $('<div />').addClass("blood being").text(this.symbol);
    this.foreground = centralizer($('<div />').append(this.blood).append(this.skin).addClass('blood-and-skin-container'));

    if (this.square)
        this.square.enter(this);
    this.viewports = [];
    this.controllers = [];

    // highly mutable attributes
    if ('generate_inventory_contents' in attributes)
        this.inventory.generate_contents = attributes.generate_inventory_contents;
    this.inventory.id = this.id + '_inv';
    this.inventory = new InventoryPlane(this.inventory);
    this.inventory.being = this;
    this.inventory.level = this.level;
    if (this.square && this.square.plane)
        this.inventory.level = Math.max(this.square.plane.level, this.inventory.level);
    for (var x = 0; x < this.inventory.width; x++) {
        for (var y = 0; y < this.inventory.height; y++) {
            this.inventory.square(new Coordinate({x: x, y: y})).reveal(this, 1);
        }
    }
    this.dead = 0;
    this.health = this.health || 1;
    this.energy = 1;
    this.body_fat = this.lean_weight * 0.3;
    this.wielding = false;
    this.hibernating = false;
    this.level = Math.ceil(this.level);
    this.experience = this.experience_for_level(this.level);
    this.knowledge = {}; // which sorts of magical tea the being has identified
    this.thoughts = {};
    this.conditions = {};
    universe.timeline.add_agent(this);
});

Being.set_name = 'clades';

Being.prototype = Object.create(WorldObject.prototype);

Being.prototype.name = 'being';
Being.prototype.power = 10;
Being.prototype.speed = 10;
Being.prototype.vigor = 10;
Being.prototype.tactics = 10;
Being.prototype.magic = 0;

Being.prototype.xray_vision = 0;

Being.prototype.scalar_attributes = ['power', 'speed', 'vigor', 'tactics', 'xray_vision'];

Being.prototype.inventory = {width: 1, height: 1};
Being.prototype.can_walk = true;
Being.prototype.can_swim = false;
Being.prototype.can_fly = false;
Being.prototype.playable = false;
Being.prototype.habitat = {};

Being.prototype.hands = 0;


// methods
Being.prototype.notify = function() {
    this.viewports.forEach(function(viewport) {viewport.render();});
};

// return true iff this.act() will not use any asynchronous callbacks
Being.prototype.synchronous = function() {
    return !this.controllers.length;
};

Being.prototype.digest = function() {
    // lose a bit over one pound per day due to very active lifestyle
    // remove leading 10000 when done testing
    weight_lost = 1000 * (this.body_fat + this.lean_weight) / (86400 * 100);
    if (this.controllers.length)
        weight_lost *= 4;
    if (this.viewports.length)
        weight_lost *= 2.5;
    this.body_fat -= weight_lost;
    if (this.body_fat < 0) {
        this.tell('You have starved.');
        this.notify();
        this.die();
    }
};

Being.prototype.act = function(callback, retry) {
    var i;
    if (!retry) {
        this.digest();
        this.check_conditions();
    }
    this.notify();
    this.hibernating = this.should_hibernate();
    if (this.hibernating) {
        delete this.next_action_time;
        return;
    }
    var subject = this;
    if (this.controllers.length > 0) {
        this.disturb_others();
        this.controllers[0].set_callback(function(command) {
            var success = command[0].execute(subject, command[1], command[2]);
            if (success) {
                callback() ;
            }
            else
                subject.act(callback, true);
        });
    }
    else {
        // wield weapons
        if (this.hands) {
            var quality = this.weapon_quality(this);
            if (this.wielding)
                quality = this.wielding.weapon_quality(this);
            var possible_weapons = this.reachable_items();
            for (i = 0; i < possible_weapons.length; i++) {
                if (possible_weapons[i].weapon_quality(this) > quality) {
                    var success = actions.wield.execute(this, possible_weapons[i]);
                    if (success)
                        return;
                }
            }
        }
        // attack
        var squares = [this.square.north(), this.square.south(), this.square.east(), this.square.west()];
        for (i = 0; i < squares.length; i++) {
            if (squares[i] && squares[i].beings.length && this.hostile(squares[i].beings[0])) {
                actions.attack.execute(this, squares[i]);
                return;
            }
        }
        // eat
        if (this.hunger() > 0) {
            var possible_food = this.reachable_items();
            for (i = 0; i < possible_food.length; i++) {
                if (possible_food[i].fat) {
                    actions.eat.execute(this, possible_food[i]);
                    return;
                }
            }
        }
        // rest if not hungry
        if (this.hunger() <= 0 && this.health < 1) {
            actions.rest.execute(this);
            return;
        }
        // collect items
        if (this.square.items.length && this.inventory.vacancy(this.square.items[0])) {
            actions.get.execute(this);
            return;
        }
        // move
        actions.moveto_or_attack.execute(this, this.choose_direction());
    }
};

Being.prototype.choose_direction = function() {
    var horizon_distance = 3;
    var location_judgments = {};
    var square;
    var squares_by_distance = [[this.square]];
    var neighbor;
    var neighbors;
    var n, i, d;
    location_judgments[this.square.coordinate.stringify()] = [0, 0];
    for (d = 0; d < horizon_distance; d++) {
        squares_by_distance.push([]);
        for (i = 0; i < squares_by_distance[d].length; i++) {
            if ((square = squares_by_distance[d][i]).permit_entry(this) || d === 0) {
                neighbors = square.neighbors_list();
                for (n = 0; n < neighbors.length; n++) {
                    neighbor = neighbors[n];
                    if (!(neighbor.coordinate.stringify() in location_judgments)) {
                        location_judgments[neighbor.coordinate.stringify()] = [d + 1, this.judge_square(neighbor)];
                        squares_by_distance[d + 1].push(neighbor);
                    }
                }
            }
        }
    }
    var judgment;
    for (d = horizon_distance; d > 0; d--) {
        for (i = 0; i < squares_by_distance[d].length; i++) {
            square = squares_by_distance[d][i];
            neighbors = square.neighbors_list();
            for (n = 0; n < neighbors.length; n++) {
                neighbor = neighbors[n];
                if (neighbor.permit_entry(this) && (judgment = location_judgments[neighbor.coordinate.stringify()])) {
                    if (judgment[0] == d - 1) {
                        judgment[1] = Math.max(judgment[1], location_judgments[square.coordinate.stringify()][1]);
                    }
                }
            }
        }
    }
    var being = this;
    return argmax(function(sq) { return location_judgments[sq.coordinate.stringify()][1] * sq.permit_entry(being); }, squares_by_distance[1]);
};

Being.prototype.judge_square = function(square) {
    var value = 0;
    if (square.items.length) {
        value += 1;
    }
    if (square.beings.length) {
        value += 1;
    }
    return value;
};

Being.prototype.moveto = function(square) {
    if (square.permit_entry(this)) {
        if (this.square)
            this.square.exit(this);
        this.square = square;
        this.square.enter(this);
        return true;
    }
    return false;
};

Being.prototype.hostile = function(other) {
    return true;
};

Being.prototype.receive_damage = function(damage, attacker) {
    this.health -= damage / this.vigor.current();
    if (this.health <= 0) {
        this.die();
    }
};

Being.prototype.redraw = function() {
    this.skin.height(Math.round(this.health * 100) + '%');
};

Being.prototype.die = function() {
    this.square.announce_all_but([this], this.The() + ' dies.');
    this.tell("You die.");
    var items = this.inventory.items();
    for (var i = 0; i < items.length; i++)
        actions.drop.execute(this, items[i]);
    if (this.corpse)
        this.corpse.create({square: this.square, fat: this.corpse.prototype.fat * (this.body_fat + this.lean_weight * 0.2)});
    this.square.exit(this);
    this.dead = 1;
    this.notify();
    if (this.viewports.length > 0) {
        $("#game-over").css('display', 'table').click(function() { location.reload(); });
        universe.game_over = true;
        var new_being = this.square.plane.random_being();
        new_being.name = japanese.name(new_being);
        this.viewports[0].set_being(new_being);
    }
};

Being.prototype.tell = function(message) {
    if (this.viewports) {
        this.viewports.forEach(function(viewport) {
            viewport.tell(message);
        });
    }
};

Being.prototype.disturb = function() {
    if (!this.next_action_time) {
        universe.timeline.add_agent(this);
    }
    this.hibernating = false;
};

Being.prototype.should_hibernate = function() {
    if (this.controllers.length)
        return false;
    for (var player_id in universe.players) {
        var player = universe.players[player_id];
        if (player.square.plane == this.square.plane && player.square.coordinate.max_distance(this.square.coordinate) <= 10);
            return false;
    }
    return true;
};

Being.prototype.disturb_others = function() {
    var radius = 10;
    var coordinate = this.square.coordinate;
    var beings = this.square.plane.tree.search([coordinate.x - radius, coordinate.y - radius, coordinate.x + radius, coordinate.y + radius]);
    for (var b = 0; b < beings.length; b++) {
        beings[b].disturb();
    }
};

Being.prototype.is_holding = function(item) {
    return (item.square.plane == this.inventory);
};

Being.prototype.gain_experience = function(exp) {
    this.experience += exp;
    var new_level = this.level_from_experience(this.experience);
    if (new_level != this.level) {
        if (new_level < this.level)
            this.tell("You have regressed to level " + new_level + ".");
        else
            this.tell("You have reached level " + new_level + "!");
        this.set_level(new_level);
    }
};

Being.prototype.set_level = function(level) {
    var old_level = this.level;
    this.level = level;
    this.speed.base *= (level - Math.ceil(Object.getPrototypeOf(this).level)) + 9;
    this.speed.base /= (old_level - Math.ceil(Object.getPrototypeOf(this).level)) + 9;
};

Being.prototype.experience_for_level = function(level) {
    return (level - 1) * level * 5;
};

Being.prototype.level_from_experience = function(experience) {
    // binary search, so experience_for_level can be edited freely
    var upper_bound = 1;
    while (this.experience_for_level(upper_bound) <= experience)
        upper_bound *= 2;
    var guess = upper_bound / 2;
    while (upper_bound - guess > 1) {
        var mid = Math.floor((upper_bound + guess) / 2);
        if (this.experience_for_level(mid) <= experience)
            guess = mid;
        else
            upper_bound = mid;
    }
    return guess;
};

Being.prototype.visibility = function(square) {
    if (square.plane != this.square.plane) // probably in inventory
        return 1;
    if (square == this.square)
        return 1;
    var total_obstacles = -this.xray_vision.current();
    var line = this.square.coordinate.line(square.coordinate);
    for (var i = 1; i < line.length-1; i++)
        total_obstacles += this.square.plane.square(line[i][0]).opacity * line[i][1];
    return Math.max(1 - total_obstacles, 0) * square.light();
};

Being.prototype.can_reach = function(square) {
    if (square.plane == this.square.plane && square.coordinate.taxicab_distance(this.square.coordinate) <= 1)
        return true;
    if (square.plane == this.inventory)
        return true;
    return false;
};

Being.prototype.reachable_items = function() {
    return this.square.items
        .concat(this.inventory.items())
        .concat(this.square.north().items)
        .concat(this.square.south().items)
        .concat(this.square.east().items)
        .concat(this.square.west().items);
};

Being.prototype.hunger = function() {
    return this.lean_weight * 0.3 - this.body_fat;
};

Being.prototype.add_condition = function(condition) {
    if (condition.name in this.conditions) {
        this.conditions[condition.name].expiration += condition.duration;
        if (condition.activation_message)
            this.tell("The duration of your " + condition.name + " has been extended.");
    } else {
        this.conditions[condition.name] = condition;
        if (condition.activation_message)
            this.tell(condition.activation_message);
    }
};

Being.prototype.check_conditions = function() {
    var message;
    for (var key in this.conditions) {
        if (this.conditions[key].expiration <= universe.timeline.time) {
            if (message = this.conditions[key].deactivation_message);
                this.tell(message);
            delete this.conditions[key];
        }
    }
};

Being.prototype.serialize = function() {
    var output = WorldObject.prototype.serialize.apply(this, arguments);
    for (var i = 0; i < this.scalar_attributes.length; i++) {
        var attribute = this.scalar_attributes[i];
        if (this[attribute].base != object.getPrototypeOf(this)[attribute])
            output[attribute] = this[attribute].base;
    }
    if (this.next_action_time && !this.hibernating)
        output.next_action_time = this.next_action_time;
    if (this.health != 1)
        output.health = this.health;
    if (this.energy != 1)
        output.energy = this.energy;
    output.body_fat = this.body_fat;
    if (this.wielding)
        output.wielding = this.wielding.id;
    if (this.knowledge.length > 0)
        output.knowledge = this.knowledge;
    if (this.conditions.length > 0) {
        output.conditions = {};
        for (var key in this.conditions)
            output.conditions[key] = this.conditions[key].expiration;
    }
    if (this.experience != this.experience_for_level(Math.ceil(Object.getPrototypeOf(this).level)))
        output.experience = this.experience;
    if (this.name != Object.getPrototypeOf(this).name)
        output.name = this.name;
    if (!this.hibernating && this.next_action_time)
        output.next_action_time = this.next_action_time;
    return output;
};
