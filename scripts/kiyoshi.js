PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']


initialize = function() {
    var plane = new WildernessPlane({width: 64, height: 64})
    var player = new Being({
        species: universe.species.human,
        square: plane.square(
            new Coordinate({
                x: 2,
                y: 3
            })
        )
    })
    var jimmy = new Being({
        species: universe.species.human,
        square: plane.square(
            new Coordinate({
                x: 6,
                y: 6
            })
        )
    })
    var katana = new Item({
        product: universe.products.katana,
        square: plane.square(
            new Coordinate({
                x: 4,
                y: 4
            })
        )
    })
    var longsword = new Item({
        product: universe.products.longsword,
        square: plane.square(
            new Coordinate({
                x: 5,
                y: 4
            })
        )
    })
    player.controllers.push(new Controller({being: player}))
    player.viewports.push(new PlayerViewport({being: player}))
    new PlaneViewport({plane: player.inventory, being: player})
    var timeline = new Timeline({start_time: 0, agents: [player, jimmy]})
    timeline.simulate()
}

