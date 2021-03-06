generate_id = function() {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

function WorldObject(attributes) {
    // this.sums[key] == sum(x.sums[key] for x in this.contents())
    this.sums = {};
    this.id = generate_id();
    if (attributes)
        for (var key in attributes)
            this[key] = attributes[key];
    if (attributes)
        this.init_attributes = attributes;
    this.sums.luminosity = this.luminosity || 0;
}

WorldObject.prototype.name = 'object';
WorldObject.prototype.continuous = false; // continuous objects will not be referenced with an indefinite article
WorldObject.prototype.habitat = {};
WorldObject.prototype.bias = -5; // the higher the number, the more common this object class will be
WorldObject.prototype.level = 1;
WorldObject.prototype.attacks = [];
WorldObject.prototype.brightness = 0;

WorldObject.prototype.constructor = WorldObject;

WorldObject.prototype.A = function(observer) {
    return english.capitalize(this.a(observer));
};

WorldObject.prototype.The = function(observer) {
    return english.capitalize(this.the(observer));
};

WorldObject.prototype.toString = WorldObject.prototype.a = function(observer) {
    var name = this.name;
    if (Setting.look.show_symbols) {
        name = name + " (" + this.symbol + ")";
    }
    if (this.count > 1)
        return this.count + " " + name;
    if (this.continuous || this.name != Object.getPrototypeOf(this).name)
        return name;
    if ("aeiouAEIOU".indexOf(name.charAt(0)) > -1)
        return "an " + name + this.suffix(observer);
    return "a " + name + this.suffix(observer);
};

WorldObject.prototype.the = function(observer) {
    var name = this.name;
    if (Setting.look.show_symbols) {
        name = name + " (" + this.symbol + ")";
    }
    if (this.name != Object.getPrototypeOf(this).name)
        return name;
    return "the " + name + this.suffix(observer);
};

WorldObject.prototype.suffix = function(observer) {
    if (!observer || !this.effect || !observer.knowledge || !observer.knowledge[this.class_id])
        return "";
    return " of " + this.effect.name;
};

WorldObject.prototype.weapon_quality = function(observer) {
    var quality = 0;
    if (this.attacks) {
        for (var i = 0; i < this.attacks.length; i++) {
            var attack = this.attacks[i].create({attacker: observer, target: observer, weapon: this, randomness: 0});
            quality = Math.max(quality, attack.damage);
        }
    }
    return quality;
};

WorldObject.prototype.serialize = function() {
    var output = {type: Object.getPrototypeOf(this).name, id: this.id};
    if (this.square) {
        output.coordinate = this.square.coordinate.serialize();
        if (this.square.plane instanceof InventoryPlane)
            output.held_by = this.square.plane.being.id;
        else
            output.region = this.square.plane.level;
    }
    return output;
};

WorldObject.prototype.tell = function(message) {
};

WorldObject.prototype.propagate_sum = function(key) {
    var old_value = this.sums[key] || 0;
    this.sums[key] = this[key] || 0;
    var contents = this.contents();
    for (var i = 0; i < contents.length; i++) {
        this.sums[key] += (contents[i].sums[key] || 0);
    }
    var new_value = this.sums[key];
    if (key == 'luminosity' && this instanceof Square) {
        if (old_value && !new_value) {
            this.plane.light_sources.remove(this);
        }
        if (new_value && !old_value) {
            this.plane.light_sources.insert(this);
        }
    }
    var container = this.container();
    if (container && old_value != new_value) {
        container.propagate_sum(key);
    }
};

WorldObject.weird_heritable_stuff = ['weird_heritable_stuff', 'specificity', 'set_name', 'variant', 'create', 'variant_of_given_specificity', 'kingdom', 'phylum', 'clazz', 'order', 'family', 'genus', 'species'];

WorldObject.specificity = -100; // more abstract classes have lower specificity

WorldObject.variant = function(attributes, f) {
    var constructor = this;
    function F() {
        constructor.apply(this, arguments);
        if (f)
            f.apply(this, arguments);
    }
    F.prototype = Object.create(constructor.prototype);
    F.specificity = this.specificity + 1;
    F.parent_class = this;
    F.prototype.generic = false;
    F.prototype.class_id = generate_id();
    for (var key in attributes)
        F.prototype[key] = attributes[key];
    F.prototype.className = F.prototype.name.replace(/ /g, '-');
    for (var i = 0; i < this.weird_heritable_stuff.length; i++)
        F[this.weird_heritable_stuff[i]] = this[this.weird_heritable_stuff[i]];
    if ('name' in attributes && !F.prototype.generic && this.set_name)
        universe[this.set_name][attributes.name] = F;
    // check for bad data
    for (i = 0; i < F.prototype.attacks.length; i++) {
        if (!F.prototype.attacks[i])
            throw("undefined attack for " + F.prototype.name);
    }
    return F;
};

WorldObject.variant_of_given_specificity = function(attributes, f, specificity) {
    var parentClass = this;
    while (parentClass.specificity >= specificity)
        parentClass = parentClass.parent_class;
    var result = parentClass.variant(attributes, f);
    result.specificity = specificity;
    return result;
};

WorldObject.kingdom = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 1);
};

WorldObject.kingdom = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 1);
};

WorldObject.phylum = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 2);
};

WorldObject.clazz = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 3);
};

WorldObject.order = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 4);
};

WorldObject.family = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 5);
};

WorldObject.genus = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 6);
};

WorldObject.species = function(attributes, f) {
    return this.variant_of_given_specificity(attributes, f, 7);
};

WorldObject.create = function(attributes) {
    return new this(attributes);
};
