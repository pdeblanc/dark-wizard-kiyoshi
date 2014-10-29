PUBLIC_STATS = ['power', 'speed', 'vigor']
STATS = ['power', 'speed', 'vigor', 'lean_mass']


initialize = function() {
    var plane = new WildernessPlane({width: 64, height: 64})
    for (var i = 0; i < 20; i++) {
        plane.place_randomly(universe.clades.human.create())
        plane.place_randomly(universe.clades.dog.create())
        plane.place_randomly(universe.clades.cat.create())
        plane.place_randomly(universe.products["bokutō"].create())
    }
    plane.place_randomly(universe.clades["blue dragon"].create())
    for (var i = 0; i < 2; i++) {
        plane.place_randomly(universe.products.katana.create())
        plane.place_randomly(universe.products.longsword.create())
    }
    for (var i = 0; i < 100; i++) {
        plane.place_randomly(universe.products.meat.create())
    }
    BuildCharacter($('#container'), function(being) {
        plane.place_randomly(being)
        new Controller({being: being, container: document.getElementById('container')})
        universe.simulate()
    })
}

