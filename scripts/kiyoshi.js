PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']


initialize = function() {
    var plane = new WildernessPlane({width: 64, height: 64})
    var player = universe.species.human.create()
    var jimmy = universe.species.human.create()
    var katana = universe.products.katana.create()
    var longsword = universe.products.longsword.create()
    plane.place_randomly(player)
    plane.place_randomly(jimmy)
    plane.place_randomly(katana)
    plane.place_randomly(longsword)
    player.controllers.push(new Controller({being: player}))
    player.viewports.push(new PlayerViewport({being: player}))
    new PlaneViewport({plane: player.inventory, being: player})
    var timeline = new Timeline({start_time: 0, agents: [player, jimmy]})
    timeline.simulate()
}

