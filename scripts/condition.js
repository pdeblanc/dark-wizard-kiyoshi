Condition = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments);
    if (this.duration)
        this.expiration = this.duration + universe.timeline.time;
});

Condition.set_name = 'conditions';
