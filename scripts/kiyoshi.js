PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']


initialize = function() {
    var plane = new WildernessPlane({width: 64, height: 64})
    var player = universe.clades.human.create()
    plane.place_randomly(player)
    for (var i = 0; i < 30; i++) {
        plane.place_randomly(universe.clades.human.create())
        plane.place_randomly(universe.products["bokutō"].create())
    }
    plane.place_randomly(universe.clades["blue dragon"].create())
    for (var i = 0; i < 2; i++) {
        plane.place_randomly(universe.products.katana.create())
        plane.place_randomly(universe.products.longsword.create())
    }
    for (var i = 0; i < 100; i++) {
        plane.place_randomly(universe.products.meat.create())
    }
    new Controller({being: player})
    universe.simulate()
}

