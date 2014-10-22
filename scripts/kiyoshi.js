PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']

ITEM_STATS = ['mass']

universe = {
    biomes: {
        grass: new Biome({name: 'grass', symbol: '草'}),
        water: new Biome({name: 'water', symbol: '水', passable: 0}),
        void: new Biome({name: 'void', symbol: '無', passable: 0}),
        empty: new Biome({name: 'empty', symbol: '無', max_items: 1})
    },
    species: {human: new Species({name: 'human', symbol: '人', lean_mass: 10})},
    products: {
        katana: new Product({name: 'katana', symbol: '刀', action: 'toggle_wield'}),
        meat: new Product({name: 'meat', symbol: '肉'})
    }
}

initialize = function() {
    var plane = new WildernessPlane({width: 256, height: 256})
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
    player.controllers.push(new Controller({being: player}))
    player.viewports.push(new PlayerViewport({being: player}))
    new PlaneViewport({plane: player.inventory, being: player})
    var timeline = new Timeline({start_time: 0, agents: [player, jimmy]})
    timeline.simulate()
}

