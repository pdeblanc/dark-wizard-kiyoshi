PUBLIC_STATS = ['speed']
STATS = ['speed', 'lean_mass']

ITEM_STATS = ['mass']

function Plane(attributes) {
    this.width = attributes.width
    this.height = attributes.height
    this.squares = {}
    this.square = function(coordinate) {
        if (coordinate.x < 0 || coordinate.y < 0 || coordinate.x >= this.width || coordinate.y >= this.height)
            return new Square({biome: universe.biomes.void, plane: this, coordinate: coordinate})
        return this.squares['_' + coordinate.x + '_' + coordinate.y]
    }
    this.vacancy = function(hopeful) {
        var coordinate = new Coordinate({x: 0, y: 0})
        for (coordinate.x = 0; coordinate.x < this.width; coordinate.x++) {
            for (coordinate.y = 0; coordinate.y < this.height; coordinate.y++) {
                var square = this.square(coordinate)
                if (square.permit_entry(hopeful)) {
                    return square;
                }
            }
        }
    }
}

function WildernessPlane(attributes) {
    Plane.apply(this, arguments)
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var biome = universe.biomes.grass;
            if (Math.random() < .2)
                biome = universe.biomes.water
            this.squares['_' + x + '_' + y] = new Square({biome: biome, plane: this, coordinate: new Coordinate({x: x, y: y})})
        }
    }
}

function InventoryPlane(attributes) {
    Plane.apply(this, arguments)
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var biome = universe.biomes.empty;
            this.squares['_' + x + '_' + y] = new Square({biome: biome, plane: this, coordinate: new Coordinate({x: x, y: y})})
        }
    }
}

function Timeline(attributes) {
    this.time = attributes.start_time
    this.agents = attributes.agents
    this.queue = new PriorityQueue({comparator: function(a, b) { return a.next_action_time - b.next_action_time }})
    for (var i = 0; i < this.agents.length; i++) {
        this.agents[i].next_action_time = this.time + Math.random() * 10 / this.agents[i].speed
        this.queue.queue(this.agents[i])
    }
    this.simulate = function() {
        var agent = this.queue.dequeue()
        this.time = agent.next_action_time
        var obj = this
        agent.act(function() {
            agent.next_action_time = obj.time + 10 / agent.speed
            obj.queue.queue(agent)
            obj.simulate()
        })
    }
}

function Square(attributes) {
    this.biome = attributes.biome
    this.span = document.createElement('span')
    this.span.className = 'biome ' + this.biome.name
    this.span.textContent = this.biome.symbol
    this.span.square = this
    this.contents = []
    this.plane = attributes.plane
    this.coordinate = attributes.coordinate
    this.offset = function(attributes) {
        return this.plane.square(this.coordinate.add(attributes))
    }
    this.north = function() {
        return this.offset({y: -1})
    }
    this.south = function() {
        return this.offset({y: 1})
    }
    this.west = function() {
        return this.offset({x: -1})
    }
    this.east = function() {
        return this.offset({x: 1})
    }
    this.exit = function(departee) {
        var index = this.contents.indexOf(departee)
        if (index > -1)
            this.contents.splice(index, 1)
        if (this.contents.length > 0) {
            this.span.innerHTML = ''
            this.span.appendChild(this.contents[0].span)
        }
        else
            this.span.innerHTML = this.biome.symbol
    }
    this.enter = function(newcomer) {
        this.contents.push(newcomer)
        this.span.innerHTML = ''
        this.span.appendChild(newcomer.span)
    }
    this.permit_entry = function(hopeful) {
        if (hopeful instanceof Being) {
            for (var i = 0; i < this.contents.length; i++) {
                if (this.contents[i] instanceof Being) {
                    return false;
                }
            }
        }
        return this.biome.passable
    }
}

function Biome(attributes) {
    this.name = attributes.name
    this.symbol = attributes.symbol
    this.passable = ('passable' in attributes) ? attributes.passable : 1;
}

function Being(attributes) {
    this.compile_attributes = function() {
        // appearance
        this.symbol = this.species.symbol
        this.span.className = 'being ' + this.species.name
        this.span.textContent = this.symbol
        for (var i = 0; i < STATS.length; i++) {
            var stat = STATS[i]
            this[stat] = 10
            for (var j = 0; j < this.aspects.length; j++) {
                this[stat] *= (this.aspects[j][stat] || 1)
            }
        }
    }

    // basic attributes
    this.species = attributes.species
    this.aspects = [this.species]
    this.aspects.push.apply(attributes.aspects || [])

    // highly mutable attributes
    this.square = attributes.square
    this.inventory = new InventoryPlane({width: 2, height: 9})

    // setup
    this.span = document.createElement('span')
    this.square.enter(this)
    this.viewports = []
    this.controllers = []

    // compile attributes
    this.compile_attributes()

    // methods
    this.notify = function() {
        this.viewports.forEach(function(viewport) {viewport.render()})
    }

    this.execute_command = function(command) {
        if (command == 'north')
            this.moveto(this.square.north())
        else if (command == 'south')
            this.moveto(this.square.south())
        else if (command == 'west')
            this.moveto(this.square.west())
        else if (command == 'east')
            this.moveto(this.square.east())
        else if (command == 'get') {
            for (var i = 0; i < this.square.contents.length; i++) {
                var item = this.square.contents[i]
                if (item instanceof Item) {
                    var vacancy = this.inventory.vacancy(item)
                    if (vacancy) {
                        item.moveto(vacancy)
                    }
                }
            }
        }
    }

    this.act = function(callback) {
        this.notify()
        var obj = this
        if (this.controllers.length > 0) {
            this.controllers[0].set_callback(function(command) {
                obj.execute_command(command)
                callback() 
            })
        }
        else {
            var actions = ['north', 'south', 'west', 'east']
            this.execute_command(actions[Math.floor(Math.random() * 4)])
            callback()
        }
    }

    this.moveto = function(square) {
        if (square.permit_entry(this)) {
            this.square.exit(this)
            this.square = square
            this.square.enter(this)
        }
    }
}

function Species(attributes) {
    this.name = 'being'
    this.symbol = '居'
    for (key in attributes) {
        this[key] = attributes[key]
    }
}

function Item(attributes) {
    this.compile_attributes = function() {
        // appearance
        this.symbol = this.product.symbol
        this.span.className = 'item ' + this.product.name
        this.span.textContent = this.symbol
        this.span.item = this
        for (var i = 0; i < ITEM_STATS.length; i++) {
            var stat = ITEM_STATS[i]
            this[stat] = 1
            for (var j = 0; j < this.aspects.length; j++) {
                this[stat] *= (this.aspects[j][stat] || 1)
            }
        }
    }

    // basic attributes
    this.product = attributes.product
    this.aspects = [this.product]
    this.aspects.push.apply(attributes.aspects || [])

    // highly mutable attributes
    this.square = attributes.square

    // setup
    this.span = document.createElement('span')
    $(this.span).draggable({ opacity: 0.7, helper: "clone"})
    this.square.enter(this)

    // compile attributes
    this.compile_attributes()

    this.moveto = function(square) {
        if (square.permit_entry(this)) {
            this.square.exit(this)
            this.square = square
            this.square.enter(this)
        }
    }
}

function Product(attributes) {
    this.name = 'item'
    this.symbol = '品'
    for (key in attributes) {
        this[key] = attributes[key]
    }
}

function Coordinate(attributes) {
    this.x = attributes.x
    this.y = attributes.y
    this.add = function(attributes) {
        x = this.x;
        y = this.y;
        if ('x' in attributes)
            x += attributes.x
        if ('y' in attributes)
            y += attributes.y
        return new Coordinate({x: x, y: y})
    }
}

function PlaneViewport(attributes) {
    this.plane = attributes.plane
    this.name = ('' + Math.random()).substring(3)
    for (var y = 0; y < this.plane.height; y++) {
        var row = $("<div />").addClass("row")
        $("#inventory").append(row)
        for (var x = 0; x < this.plane.width; x++) {
            row.append(viewportCell("_" + this.name + "_" + x + "_" + y))
        }
    }
    this.render = function() {
        for (var x = 0; x < this.plane.width; x++) {
            for (var y = 0; y < this.plane.height; y++) {
                var square = this.plane.square(new Coordinate({x: x, y: y}))
                $('#_' + this.name + '_' + x + '_' + y).html('').append(square.span)
            }
        }
    }
    this.render()
}

function PlayerViewport(attributes) {
    this.being = attributes.being
    $("#name").text('Peter')
    $("#title").text(this.being.species.name).addClass(this.being.species.name)
    var stats_div = document.getElementById('stats')
    for (var i = 0; i < PUBLIC_STATS.length; i++) {
        var stat_div = document.createElement('div')
        var stat_label = document.createElement('span')
        stat_label.textContent = PUBLIC_STATS[i] + ': '
        var stat_value = document.createElement('span')
        stat_value.className = 'stat-value'
        stat_value.id = PUBLIC_STATS[i]
        stat_value.textContent = this.being[PUBLIC_STATS[i]]
        stat_div.appendChild(stat_label)
        stat_div.appendChild(stat_value)
        stats_div.appendChild(stat_div)
    }
    this.being.span.className += ' player'
    this.left = -4
    this.right = 4
    this.top = -4
    this.bottom = 4
    for (var y = this.top; y <= this.bottom; y++) {
        var row = $("<div />").addClass("row")
        $("#viewport").append(row)
        for (var x = this.left; x <= this.right; x++) {
            row.append(viewportCell("_" + x + "_" + y))
        }
    }
    this.render = function() {
        var origin = this.being.square
        var plane = origin.plane
        for (var x = this.left; x <= this.right; x++) {
            for (var y = this.top; y <= this.bottom; y++) {
                var square = plane.square(new Coordinate({x: origin.coordinate.x + x, y: origin.coordinate.y + y}))
                $('#_' + x + '_' + y).html('').append(square.span)
            }
        }
    }
}

function viewportCell(id) {
    return $("<span />")
        .addClass("cell")
        .attr("id", id)
        .droppable({
            accept: ".item",
            hoverClass: "drag-target",
            drop: function(event, ui) {
                console.log('drop')
                var item = ui.draggable[0].item
                var square = this.childNodes[0].square
                item.moveto(square)
                console.log(item)
            }
        })
}

function Controller(attributes) {
    this.being = attributes.being;
    this.commands = []
    this.command_callbacks = []
    this.set_callback = function(callback) {
        if (this.commands.length > 0) {
            command = this.commands.shift()
            return callback(command)
        }
        this.command_callbacks.push(callback)
    }
    this.push_command = function(command) {
        this.commands.push(command)
        if (this.command_callbacks.length > 0) {
            callback = this.command_callbacks.shift()
            command = this.commands.shift()
            return callback(command)
        }
    }
    var controller = this
    document.body.addEventListener(
        'keydown',
        function(event) {
            if (event.keyCode == 37)
                controller.push_command('west')
            if (event.keyCode == 38)
                controller.push_command('north')
            if (event.keyCode == 39)
                controller.push_command('east')
            if (event.keyCode == 40)
                controller.push_command('south')
        },
        false
    )
    document.body.addEventListener(
        'keypress',
        function(event) {
            var charStr = String.fromCharCode(event.which || event.keyCode)
            if (charStr == 'g')
                controller.push_command('get')
        },
        false
    )
}

universe = {
    biomes: {
        grass: new Biome({name: 'grass', symbol: '草'}),
        water: new Biome({name: 'water', symbol: '水', passable: 0}),
        void: new Biome({name: 'void', symbol: '無', passable: 0}),
        empty: new Biome({name: 'empty', symbol: '無'})
    },
    species: {human: new Species({name: 'human', symbol: '人', lean_mass: 10})},
    products: {katana: new Product({name: 'katana', symbol: '刀'})}
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
    new PlaneViewport({plane: player.inventory})
    var timeline = new Timeline({start_time: 0, agents: [player, jimmy]})
    timeline.simulate()
}

