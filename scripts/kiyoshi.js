PUBLIC_STATS = ['power', 'speed', 'vigor', 'level', 'experience']
STATS = ['power', 'speed', 'vigor', 'lean_mass']

Being
    .kingdom({name: 'animal', generic: true, bias: -5})
        .phylum({name: 'human', symbol: '人', lean_mass: 100, attacks: [{punch: 1}], inventory: {width: 2, height: 9}, level: 2, playable: true, bias: -4, habitat: {town: 2}})
            .clazz({name: 'samurai', symbol: '侍', attacks: [{cut: 3}], playable: false})
        .phylum({name: 'blue dragon', symbol: '龍', lean_mass: 10000, vigor: 100, attacks: [{burn: 9}], can_fly: true, inventory: {width: 1, height: 3}, level: 10})
        .phylum({name: 'cat', symbol: '猫', lean_mass: 10, vigor: 3, attacks: [{scratch: 1}], playable: true})
        .phylum({name: 'dog', symbol: '犬', lean_mass: 30, vigor: 5, attacks: [{bite: 1}], playable: true})
        .phylum({name: 'mouse', symbol: '鼠', lean_mass: 0.1, vigor: 0.3, speed: 30, attacks: [{bite: .1}]})
            .clazz({name: 'rat', symbol: '鼠', lean_mass: 1, vigor: 1, speed: 20, attacks: [{bite: .2}]})
        .phylum({name: 'bird', symbol: '鳥', lean_mass: 0.1, vigor: 0.2, speed: 30, attacks: [{peck: .1}], can_fly: true, playable: true})
        .phylum({name: 'rabbit', symbol: '兎', lean_mass: 4, vigor: 2, speed: 15, attacks: [{bite: .4}]})
        .phylum({name: 'horse', symbol: '馬', lean_mass: 850, vigor: 29, speed: 13, attacks: [{kick: 2}], level: 2, habitat: {grass: 5}, bias: -9})
        .phylum({name: 'cow', symbol: '牛', lean_mass: 1000, vigor: 32, speed: 8, attacks: [{kick: 2}], level: 2, habitat: {grass: 5}, bias: -9})
        .phylum({name: 'fish', symbol: '魚', lean_mass: 2, vigor: 2, attacks: [{bite: 0.2}], can_walk: false, can_swim: true, playable: true})
        .phylum({name: 'battleship', symbol: '艦', lean_mass: 20000000, vigor: 4472, attacks: [{shoot: 300}], can_walk: false, can_swim: true, level: 256, inventory: {width: 4, height: 9}})
        .phylum({name: 'fire being', symbol: '火', lean_mass: 100, speed: 15, attacks: [{burn: 3}], level: 4})

Item
    .kingdom({name: 'katana', symbol: '刀', action: actions.toggle_wield, attack: {cut: 5}, level: 3})
        .phylum({name: 'bokutō', attack: {hit: 2}, level: 1})
    .kingdom({name: 'sword', symbol: '剣', action: actions.toggle_wield, attack: {cut: 5}, generic: true, level: 3})
        .phylum({name: 'longsword', symbol: '剣', action: actions.toggle_wield, attack: {cut: 5}})
        .phylum({name: 'rapier', symbol: '剣', action: actions.toggle_wield, attack: {stab: 3}, level: 2})
    .kingdom({name: 'meat', symbol: '肉', fat: 2, action: actions.eat, attack: {slap: .5}})
    .kingdom({name: 'green tea', symbol: '茶', action: actions.drink, drinkable: true})

Square
    .kingdom({name: 'ground', symbol: '土', continuous: true, walkable: true, flyable: true, generic: true})
        .phylum({name: 'grass', symbol: '草'})
        .phylum({name: 'woods', symbol: '林'})
        .phylum({name: 'forest', symbol: '森', continuous: false})
        .phylum({name: 'downward staircase', symbol: '＞', can_descend: true, clumpiness: 0, bias: -1.5})
        .phylum({name: 'upward staircase', symbol: '＜', can_ascend: true, clumpiness: 0, bias: -2})
    .kingdom({name: 'obstacle', symbol: '壁', continuous: false, flyable: true, generic: true, max_items: 0})
        .phylum({name: 'tree', symbol: '木', bias: -1})
    .kingdom({name: 'liquid', symbol: '液', continuous: true, flyable: true, swimmable: true, generic: true})
        .phylum({name: 'water', symbol: '水', drinkable: true, bias: 1})
    .kingdom({name: 'town', symbol: '町', continuous: false, flyable: true, walkable: true, generic: true, tags: {town: 1}, clumpiness: 0})
        .phylum({name: 'grass2', symbol: '草'})
        .phylum({name: 'house', symbol: '家', bias: -.5})
        .phylum({name: 'shop', symbol: '店', bias: -1})
    .kingdom({name: 'void', symbol: '無', bias: -100, continuous: true})
        .phylum({name: 'inventory slot', max_items: 1, continuous: false})

universe.friends('woods', 'forest')
universe.friends('woods', 'tree')
universe.friends('forest', 'tree')
universe.friends('town', 'town')

planes = [new WildernessPlane({level: 1, tags: {woods: 1, town: -1}})]
planes.push(new WildernessPlane({upstairs: planes[planes.length - 1], tags: {grass: 1, town: -1}}))
planes.push(new WildernessPlane({upstairs: planes[planes.length - 1]}))
planes.push(new WildernessPlane({upstairs: planes[planes.length - 1], tags: {water: .25}}))

initialize = function() {
    BuildCharacter($('#container'), function(being) {
        planes[0].place_randomly(being)
        new Controller({being: being, container: document.getElementById('container')})
        universe.simulate()
    })
}

