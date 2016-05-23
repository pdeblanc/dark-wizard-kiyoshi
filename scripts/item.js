Item = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments);
    this.count = 1;
    this.foreground = document.createElement('span');
    if (this.square)
        this.square.enter(this);
    this.foreground.className = this.className;
    this.foreground.textContent = this.symbol;
    this.foreground = centralizer(this.foreground).addClass('item');
    this.foreground[0].item = this;
    this.wield_sound = 'wield';
    $(this.foreground).draggable({opacity: 0.7, helper: "clone", zIndex: 1000});
});

Item.set_name = 'products';

Item.prototype = Object.create(WorldObject.prototype);

Item.prototype.name = 'item';

Item.prototype.stackable = false;
Item.prototype.fat = 0;
Item.prototype.drinkable = false;
Item.prototype.weight = 1;

Item.prototype.can_stack_with = function(other_item) {
    return this.stackable && Object.getPrototypeOf(this) == Object.getPrototypeOf(other_item);
};

Item.prototype.stack_into = function(stack) {
    stack.count += this.count;
    this.destroy();
};

Item.prototype.moveto = function(square) {
    if (square.permit_entry(this)) {
        if (this.square)
            this.square.exit(this);
        this.square = square;
        this.square.enter(this);
        this.check_wielding();
        return true;
    }
    return false;
};

Item.prototype.destroy = function() {
    this.square.exit(this);
    if (this.wielded_by)
        this.wielded_by.wielding = false;
};

Item.prototype.default_action = function() {
    return this.action;
};

Item.prototype.check_wielding = function() {
    var subject;
    if ((subject = this.wielded_by) && !(subject.is_holding(this)))
        actions.unwield.execute(subject, this);
};

Item.prototype.serialize = function() {
    var output = WorldObject.prototype.serialize.apply(this, arguments);
    if (this.fat != Object.getPrototypeOf(this).fat)
        output.fat = this.fat;
    return output;
};

Item.variant = function(attributes, f) {
    var F = WorldObject.variant.apply(this, arguments);
    var proto = F.prototype;
    if (proto.random_effects && proto.random_effects.length && !proto.generic) {
        proto.effect = Probability.sample(proto.random_effects.map(function(effect) { return [effect, 1]; }), universe.seed + this.prototype.name);
        proto.level += proto.effect.level;
        proto.random_effects.splice(i, 1);
    }
    return F;
};

