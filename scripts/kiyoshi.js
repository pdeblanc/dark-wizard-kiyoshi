PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']

Being.variant({name: 'human', symbol: '人', lean_mass: 100, attacks: [{punch: 1}]})
universe.clades.human.variant({name: 'samurai', symbol: '侍', attacks: [{cut: 3}]})
Being.variant({name: 'blue dragon', symbol: '龍', lean_mass: 2000, vigor: 200, attacks: [{burn: 9}]})
Being.variant({name: 'cat', symbol: '猫', lean_mass: 10, vigor: 2, attacks: [{scratch: 1}]})
Being.variant({name: 'dog', symbol: '犬', lean_mass: 30, vigor: 5, attacks: [{bite: 1}]})
Item.variant({name: 'katana', symbol: '刀', action: actions.toggle_wield, attack: {cut: 5}})
universe.products.katana.variant({name: 'bokutō', attack: {hit: 2}})
Item.variant({name: 'longsword', symbol: '剣', action: actions.toggle_wield, attack: {cut: 5}})
Item.variant({name: 'meat', symbol: '肉', fat: 2, action: actions.eat, attack: {slap: .5}})
Square.variant({name: 'grass', symbol: '草', continuous: true})
Square.variant({name: 'tree', symbol: '木', passable: false, bias: -1})
Square.variant({name: 'woods', symbol: '林', passable: true, continuous: true})
universe.biomes.woods.variant({name: 'forest', symbol: '森', continuous: false})
Square.variant({name: 'water', symbol: '水', passable: false, continuous: true})
Square.variant({name: 'void', symbol: '無', passable: 0, bias: -100, continuous: true})
universe.biomes.void.variant({name: 'inventory slot', passable: 1, max_items: 1, max_beings: 0, continuous: false})

initialize = function() {
    var plane = new WildernessPlane({width: 32, height: 32})
    top.plane = plane
    BuildCharacter($('#container'), function(being) {
        plane.place_randomly(being)
        new Controller({being: being, container: document.getElementById('container')})
        universe.simulate()
    })
}

