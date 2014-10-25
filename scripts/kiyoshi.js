PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']


initialize = function() {
    var plane = new WildernessPlane({width: 64, height: 64})
    var player = new Being({
        species: universe.species.human
    })
    var jimmy = new Being({
        species: universe.species.human
    })
    var katana = new Item({
        product: universe.products.katana
    })
    var longsword = new Item({
        product: universe.products.longsword
    })
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

