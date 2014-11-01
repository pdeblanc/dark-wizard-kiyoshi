PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']

Being.variant({common_name: 'human', symbol: '人', lean_mass: 10, attacks: [{punch: 1}]})
universe.clades.human.variant({common_name: 'samurai', symbol: '侍', attacks: [{cut: 3}]})
Being.variant({common_name: 'blue dragon', symbol: '龍', lean_mass: 200, vigor: 20, attacks: [{burn: 9}]})
Being.variant({common_name: 'cat', symbol: '猫', lean_mass: 1, vigor: .2, attacks: [{scratch: 1}]})
Being.variant({common_name: 'dog', symbol: '犬', lean_mass: 3, vigor: .5, attacks: [{bite: 1}]})
Item.variant({common_name: 'katana', symbol: '刀', action: 'toggle_wield', attack: {cut: 5}})
universe.products.katana.variant({common_name: 'bokutō', attack: {hit: 2}})
Item.variant({common_name: 'longsword', symbol: '剣', action: 'toggle_wield', attack: {cut: 5}})
Item.variant({common_name: 'meat', symbol: '肉', fat: 2, action: 'eat', attack: {slap: .5}})

initialize = function() {
    var plane = new WildernessPlane({width: 64, height: 64})
    for (var i = 0; i < 20; i++) {
        plane.place_randomly(universe.clades.human.create())
        plane.place_randomly(universe.clades.dog.create())
        plane.place_randomly(universe.clades.cat.create())
    }
    for (var i = 0; i < 10; i++) {
        plane.place_randomly(universe.clades.samurai.create())
    }
    plane.place_randomly(universe.clades["blue dragon"].create())
    for (var i = 0; i < 2; i++) {
        plane.place_randomly(new universe.products.katana({}))
        plane.place_randomly(new universe.products.longsword({}))
    }
    for (var i = 0; i < 100; i++) {
        plane.place_randomly(new universe.products.meat({}))
    }
    BuildCharacter($('#container'), function(being) {
        plane.place_randomly(being)
        new Controller({being: being, container: document.getElementById('container')})
        universe.simulate()
    })
}

