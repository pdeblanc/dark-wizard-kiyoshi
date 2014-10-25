PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']


initialize = function() {
    var plane = new WildernessPlane({width: 64, height: 64})
    var player = universe.species.human.create()
    var jimmy = universe.species.human.create()
    var dragon = universe.species.dragon.create()
    plane.place_randomly(player)
    plane.place_randomly(jimmy)
    plane.place_randomly(dragon)
    plane.place_randomly(universe.products.katana.create())
    plane.place_randomly(universe.products.longsword.create())
    for (var i = 0; i < 10; i++) {
        plane.place_randomly(universe.products.meat.create())
    }
    new Controller({being: player})
    var timeline = new Timeline({start_time: 0, agents: [player, jimmy, dragon]})
    timeline.simulate()
}

