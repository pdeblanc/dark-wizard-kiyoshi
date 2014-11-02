PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']

Being.variant({common_name: 'human', symbol: '人', lean_mass: 100, attacks: [{punch: 1}]})
universe.clades.human.variant({common_name: 'samurai', symbol: '侍', attacks: [{cut: 3}]})
Being.variant({common_name: 'blue dragon', symbol: '龍', lean_mass: 2000, vigor: 200, attacks: [{burn: 9}]})
Being.variant({common_name: 'cat', symbol: '猫', lean_mass: 10, vigor: 2, attacks: [{scratch: 1}]})
Being.variant({common_name: 'dog', symbol: '犬', lean_mass: 30, vigor: 5, attacks: [{bite: 1}]})
Item.variant({common_name: 'katana', symbol: '刀', action: 'toggle_wield', attack: {cut: 5}})
universe.products.katana.variant({common_name: 'bokutō', attack: {hit: 2}})
Item.variant({common_name: 'longsword', symbol: '剣', action: 'toggle_wield', attack: {cut: 5}})
Item.variant({common_name: 'meat', symbol: '肉', fat: 2, action: 'eat', attack: {slap: .5}})
Square.variant({common_name: 'grass', symbol: '草', continuous: true})
Square.variant({common_name: 'tree', symbol: '木', passable: false, bias: -1})
Square.variant({common_name: 'woods', symbol: '林', passable: true, continuous: true})
universe.biomes.woods.variant({common_name: 'forest', symbol: '森', continuous: false})
Square.variant({common_name: 'water', symbol: '水', passable: false, continuous: true})
Square.variant({common_name: 'void', symbol: '無', passable: 0, bias: -100, continuous: true})
universe.biomes.void.variant({common_name: 'inventory slot', passable: 1, max_items: 1, continuous: false})

universe.friends('grass', 'grass')
universe.friends('water', 'water')

initialize = function() {
    var plane = new WildernessPlane({width: 16, height: 16})
    top.plane = plane
    for (var i = 0; i < 1; i++) {
        plane.place_randomly(universe.clades.human.create())
        plane.place_randomly(universe.clades.dog.create())
        plane.place_randomly(universe.clades.cat.create())
    }
    for (var i = 0; i < 1; i++) {
        plane.place_randomly(universe.clades.samurai.create())
    }
    plane.place_randomly(universe.clades["blue dragon"].create())
    for (var i = 0; i < 1; i++) {
        plane.place_randomly(new universe.products.katana({}))
        plane.place_randomly(new universe.products.longsword({}))
    }
    for (var i = 0; i < 1; i++) {
        plane.place_randomly(new universe.products.meat({}))
    }
    BuildCharacter($('#container'), function(being) {
        plane.place_randomly(being)
        new Controller({being: being, container: document.getElementById('container')})
        universe.simulate()
    })
}

