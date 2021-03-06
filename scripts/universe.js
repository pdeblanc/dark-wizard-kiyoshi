function Universe(attributes) {
    this.clades = {};
    this.products = {};
    this.biomes = {};
    this.attacks = {};
    this.affinities = {};
    this.conditions = {};
    this.game_over = false;
    this.players = {};
    this.timeline = new Timeline({start_time: 0, universe: this});
    this.planes = [];
    this.seed = 0;
} 

Universe.prototype.simulate = function() {
    this.timeline.simulate();
};

Universe.prototype.biome = function(attributes) {
    attributes.universe = this;
    return new Biome(attributes);
};

Universe.prototype.affinity = function(a, b, x) {
    if (x === undefined) {
        if (a in this.affinities && b in this.affinities[a])
            return this.affinities[a][b];
        return false;
    }
    this.affinities[a] = this.affinities[a] || {};
    this.affinities[b] = this.affinities[b] || {};
    this.affinities[a][b] = this.affinities[b][a] = x;
};

Universe.prototype.friends = function(a, b) {
    this.affinity(a, b, 1);
};

Universe.prototype.foes = function(a, b) {
    this.affinity(a, b, -1);
};

Universe.prototype.add_plane = function(attributes) {
    attributes = Object.create(attributes);
    attributes.level = this.planes.length + 1;
    attributes.id = '_' + this.planes.length + 1;
    if (this.planes.length)
        attributes.upstairs = this.planes[this.planes.length - 1];
    this.planes.push(new WildernessPlane(attributes));
};

Universe.prototype.serialize = function() {
    var output = {planes: [], beings: [], items: []};
    for (var i = 0; i < this.planes.length; i++) {
        var plane = this.planes[i];
        output.planes.push(plane.serialize());
        Array.prototype.push.apply(output.beings, plane.serialize_beings());
        Array.prototype.push.apply(output.items, plane.serialize_items());
    }
    output.beings.sort(function(a, b) {return (a.id < b.id);});
    output.items.sort(function(a, b) {return (a.id < b.id);});
    output.players = Object.keys(this.players);
    output.time = this.timeline.time;
    return JSON.stringify(output, undefined, 2);
};

Universe.prototype.load_game = function(save_file) {
    var i, attributes;
    var game = JSON.parse(save_file);
    // deserialize time
    this.timeline.time = game.time;
    // deserialize planes
    for (i = 0; i < game.planes.length; i++) {
        var keys_array = game.planes[i];
        for (var j = 0; j < keys_array.length; j++)
            this.planes[i].emptied_square_keys[keys_array[j]] = 1;
    }
    // deserialize beings
    var beings = {};
    for (i = 0; i < game.beings.length; i++) {
        attributes = game.beings[i];
        var clade = this.clades[attributes.type];
        // build coordinate
        attributes.coordinate = new Coordinate(attributes.coordinate);
        attributes.square = universe.planes[attributes.region - 1].square(attributes.coordinate);
        delete attributes.coordinate;
        attributes.generate_inventory_contents = false;
        // create being
        beings[attributes.id] = clade.create(attributes);
    }
    // deserialize items
    for (i = 0; i < game.items.length; i++) {
        attributes = game.items[i];
        var product = this.products[attributes.type];
        // build coordinate
        attributes.coordinate = new Coordinate(attributes.coordinate);
        if ('region' in attributes)
            attributes.square = universe.planes[attributes.region - 1].square(attributes.coordinate);
        else if ('held_by' in attributes)
            attributes.square = beings[attributes.held_by].inventory.square(attributes.coordinate);
        delete attributes.coordinate;
        product.create(attributes);
    }
    // return player
    return beings[game.players[0]];
};

var universe = new Universe();

function values_by_sorted_keys(object) {
    var keys = Object.keys(object);
    keys.sort();
    var values = [];
    for (var i = 0; i < keys.length; i++) {
        values.push(object[keys[i]]);
    }
    return values;
}
