Square = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments);
    this.cell = undefined;
    this.square = this;
    this.background = document.createElement('div');
    this.background.className = 'square-background ' + this.className;
    this.foreground = document.createElement('div');
    this.foreground.className = this.className;
    this.foreground.innerHTML = this.symbol;
    this.foreground = centralizer(this.foreground);
    this.items = [];
    this.beings = [];
    this.plane = attributes.plane;
    this.coordinate = attributes.coordinate;
    this.id = this.plane.id + this.coordinate.stringify();
    var being, item;
    this.starting_beings = this.sample_contents(universe.clades);
    this.starting_items = this.sample_contents(universe.products);
    if (!this.generate_contents) {
        this.beings = [];
        this.items = [];
    }
    this.name = this.name.replace(/[0-9]/g, "");
    this.populated = (this.beings.length > 0 || this.items.length > 0);
});

Square.variant = function(attributes, f) {
    var F = WorldObject.variant.apply(this, arguments);
    F.prototype.tags = {};
    F.prototype.tags[F.prototype.name] = 1;
    if ('tags' in attributes)
        F.prototype.extra_tags = attributes.tags;
    $.extend(F.prototype.tags, F.prototype.extra_tags);
    if (universe.affinity(F.prototype.name, F.prototype.name) === false)
        universe.affinity(F.prototype.name, F.prototype.name, F.prototype.clumpiness);
    return F;
};

Square.set_name = 'biomes';

Square.prototype = Object.create(WorldObject.prototype);

Square.prototype.name = 'square';
Square.prototype.extra_tags = [];

Square.prototype.walkable = false;
Square.prototype.swimmable = false;
Square.prototype.flyable = false;
Square.prototype.can_descend = false;
Square.prototype.can_ascend = false;

Square.prototype.generate_contents = true;

Square.prototype.opacity = 0;

Square.prototype.max_beings = 1;
Square.prototype.max_items = 16;
Square.prototype.tags = [];
Square.prototype.bias = 0;
Square.prototype.clumpiness = 1;

Square.prototype.light = function() {
    var light = this.plane.light;
    var radius = 4;
    var coordinate = this.coordinate;
    var sources = this.plane.light_sources.search([coordinate.x - radius, coordinate.y - radius, coordinate.x + radius, coordinate.y + radius]);
    for (var i = 0; i < sources.length; i++) {
        light += sources[i].brightness / Math.pow(sources[i].square.coordinate.euclidean_distance(this.coordinate, 0.5), 2);
    }
    return Math.max(0, Math.min(1, light));
};

// index is an object whose keys are things that may be placed in the square
Square.prototype.sample_contents = function(index) {
    var probability_array = [[false, 1]];
    var keys = Object.keys(index);
    keys.sort(); // for great determinism
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var object_class = index[key];
        if (this.permit_entry(object_class.prototype)) {
            var p = Math.exp(object_class.prototype.bias + this.affinity(object_class.prototype.habitat));
            var level = Math.max(1, object_class.prototype.level);
            if (this.plane.level > level)
                p *= level / this.plane.level;
            else
                p *= Math.pow(this.plane.level / level, 2);
            probability_array.push([object_class, p]);
        }
    }
    var thingClass = Probability.sample(probability_array, this.coordinate.seed() + 'square_contents' + this.plane.seed + '_' + universe.seed);
    if (thingClass)
        return [thingClass.create({square: this, id: this.id + '_' + thingClass.prototype.name})];
    return [];
};

Square.prototype.offset = function(attributes) {
    return this.plane.square(this.coordinate.add(attributes));
};
Square.prototype.north = function() {
    return this.offset({y: -1});
};
Square.prototype.south = function() {
    return this.offset({y: 1});
};
Square.prototype.west = function() {
    return this.offset({x: -1});
};
Square.prototype.east = function() {
    return this.offset({x: 1});
};
Square.prototype.exit = function(departee) {
    var array = (departee instanceof Being) ? this.beings : this.items;
    var index = array.indexOf(departee);
    if (index > -1)
        array.splice(index, 1);
    if (departee instanceof Being)
        this.plane.tree.remove(departee);
    if (departee.brightness)
        this.plane.light_sources.remove(departee);
};
Square.prototype.enter = function(newcomer) {
    var array = (newcomer instanceof Being) ? this.beings : this.items;
    array.push(newcomer);
    if (newcomer instanceof Being) {
        this.plane.tree.insert(newcomer);
        if (this.items.length)
            newcomer.tell("You find " + english.list(this.items, newcomer) + ".");
        for (var i = 0; i < this.attacks.length; i++) {
            new this.attacks[i]({attacker: this, target: newcomer}).execute();
        }
    }
    if (newcomer.brightness)
        this.plane.light_sources.insert(newcomer);
};
Square.prototype.permit_entry = function(hopeful) {
    if (hopeful instanceof Being && this.beings.length < this.max_beings)
        return ((this.walkable && hopeful.can_walk) || (this.flyable && hopeful.can_fly) || (this.swimmable && hopeful.can_swim));
    if (hopeful instanceof Item)
        return (this.items.length < this.max_items);
    return false;
};
Square.prototype.announce_all_but = function(exclude, message) {
    var radius = 4;
    var beings = this.plane.tree.search([this.coordinate.x - radius, this.coordinate.y - radius, this.coordinate.x + radius, this.coordinate.y + radius]);
    for (var b = 0; b < beings.length; b++) {
        if (exclude.indexOf(beings[b]) == -1)
            beings[b].tell(message);
    }
};
Square.prototype.announce = function(message) {
    this.announce_all_but([], message);
};
Square.prototype.affinity = function(tags) {
    var total = 0;
    for (var this_tag in this.tags)
        for (var other_tag in tags)
            total += universe.affinity(this_tag, other_tag) * this.tags[this_tag] * tags[other_tag];
    if (this.plane instanceof InventoryPlane) {
       if (Object.getPrototypeOf(this.plane.being).name in tags)
          total += tags[Object.getPrototypeOf(this.plane.being).name];
    }
    return total;
};
Square.prototype.next_to = function(other) {
    return (other == this.north() || other == this.south() || other == this.west() || other == this.east());
};
Square.prototype.reveal = function(being, visibility) {
    return;
};
// render this within cell as it would appear to being 
Square.prototype.blit = function(being, cell) {
    // associate cell and square
    if (cell[0].square && cell[0].square != this) {
        cell[0].square.cell = undefined;
    }
    cell[0].square = this;
    this.cell = cell[0];
    // render stuff
    var shader = $('<div />').addClass('square-shading').css('opacity', 1 - being.visibility(this));
    var highlight = $('<div />').addClass('square-highlight');
    cell.removeClass('wielded');
    if (this.beings.length) {
        this.beings[0].redraw();
        cell.empty().append(this.background).append(this.beings[0].foreground).append(shader).append(highlight);
    } else if (this.items.length) {
        var item = this.items[0];
        if (item.wielded_by == being)
            cell.addClass('wielded').empty().append(item.foreground).append(shader).append(highlight);
        else
            cell.empty().append(this.background).append(item.foreground).append(shader).append(highlight);
    } else
        cell.empty().append(this.background).append(this.foreground).append(shader).append(highlight);
};

Square.prototype.neighbors = function() {
    return {north: this.north(), south: this.south(), east: this.east(), west: this.west()};
};

Square.prototype.neighbors_list = function() {
    return [this.north(), this.south(), this.east(), this.west()];
};

// return true if the square's state has changed from its initial state
Square.prototype.state_changed = function() {
    function map_ids (L) {
        return L.map(function(item) { return item.id; }).join(", ");
    }
    return (map_ids(this.items) != map_ids(this.starting_items) || map_ids(this.beings) != map_ids(this.starting_beings));
};

Square.prototype.flash = function() {
    var counter, cell;
    function step() {
        counter += 1;
        if (counter < 10) {
            shadow_string = "0px 0px " + counter + "px rgba(255, 255, 255, " + ((10 - counter) / 10)  + ")";
            cell.style.textShadow = shadow_string + "," + shadow_string + "," + shadow_string + "," + shadow_string;
            setTimeout(step, 60);
        }
        else {
            cell.style.textShadow = "";
        }
    }
    if (this.cell) {
        cell = this.cell;
        counter = 0;
        step();
    }
};
