PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']

Being
    .kingdom({name: 'animal', generic: true, inventory: {width: 1, height: 1}})
        .phylum({name: 'human', symbol: '人', lean_mass: 100, attacks: [{punch: 1}], inventory: {width: 2, height: 9}})
            .clazz({name: 'samurai', symbol: '侍', attacks: [{cut: 3}]})
        .phylum({name: 'blue dragon', symbol: '龍', lean_mass: 2000, vigor: 200, attacks: [{burn: 9}]})
        .phylum({name: 'cat', symbol: '猫', lean_mass: 10, vigor: 2, attacks: [{scratch: 1}]})
        .phylum({name: 'dog', symbol: '犬', lean_mass: 30, vigor: 5, attacks: [{bite: 1}]})
        .phylum({name: 'mouse', symbol: '鼠', lean_mass: 0.1, vigor: 0.02, speed: 30, attacks: [{bite: .1}]})
            .clazz({name: 'rat', symbol: '鼠', lean_mass: 1, vigor: 0.2, speed: 20, attacks: [{bite: .3}]})
        .phylum({name: 'bird', symbol: '鳥', lean_mass: 0.1, vigor: 0.02, speed: 30, attacks: [{peck: .1}]})
        .phylum({name: 'rabbit', symbol: '兎', lean_mass: 4, vigor: 0.5, speed: 15, attacks: [{bite: .5}]})
        .phylum({name: 'horse', symbol: '馬', lean_mass: 850, vigor: 85, speed: 13, attacks: [{kick: 2}]})
        .phylum({name: 'cow', symbol: '牛', lean_mass: 1000, vigor: 100, speed: 8, attacks: [{kick: 1.5}]})

Item
    .kingdom({name: 'katana', symbol: '刀', action: actions.toggle_wield, attack: {cut: 5}})
        .phylum({name: 'bokutō', attack: {hit: 2}})
    .kingdom({name: 'sword', symbol: '剣', action: actions.toggle_wield, attack: {cut: 5}, generic: true})
        .phylum({name: 'longsword', symbol: '剣', action: actions.toggle_wield, attack: {cut: 5}})
        .phylum({name: 'rapier', symbol: '剣', action: actions.toggle_wield, attack: {stab: 3}})
    .kingdom({name: 'meat', symbol: '肉', fat: 2, action: actions.eat, attack: {slap: .5}})
    .kingdom({name: 'green tea', symbol: '茶', action: actions.drink, drinkable: true})

Square.variant({name: 'grass', symbol: '草', continuous: true})
Square.variant({name: 'tree', symbol: '木', passable: false, bias: -1})
Square.variant({name: 'woods', symbol: '林', passable: true, continuous: true})
universe.biomes.woods.variant({name: 'forest', symbol: '森', continuous: false})
Square.variant({name: 'water', symbol: '水', passable: false, continuous: true, drinkable: true})
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

