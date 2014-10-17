PUBLIC_STATS = ['speed']
STATS = ['speed', 'lean_mass']

function Plane(attributes) {
    this.width = attributes.width
    this.height = attributes.width
    this.squares = {}
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var biome = universe.biomes.grass;
            if (Math.random() < .2)
                biome = universe.biomes.water
            this.squares['_' + x + '_' + y] = new Square({biome: biome, plane: this, coordinate: new Coordinate({x: x, y: y})})
        }
    }
    this.square = function(coordinate) {
        if (coordinate.x < 0 || coordinate.y < 0 || coordinate.x >= this.width || coordinate.y >= this.height)
            return new Square({biome: universe.biomes.void, plane: this, coordinate: coordinate})
        return this.squares['_' + coordinate.x + '_' + coordinate.y]
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
        return this.biome.passable && (this.contents.length == 0)
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
        this.span.className = this.species.name
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

function Viewport(attributes) {
    this.being = attributes.being
    document.getElementById('name').textContent = 'Peter'
    document.getElementById('title').textContent = this.being.species.name;
    document.getElementById('title').className = this.being.species.name;
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
    this.container = attributes.container
    this.being.span.className += ' player'
    this.left = -4
    this.right = 4
    this.top = -4
    this.bottom = 4
    this.cells = {}
    for (var y = this.top; y <= this.bottom; y++) {
        var row = document.createElement('div')
        row.className = 'row'
        this.container.appendChild(row)
        for (var x = this.left; x <= this.right; x++) {
            var cell = document.createElement('span')
            cell.className = 'cell'
            row.appendChild(cell)
            this.cells['_' + x + '_' + y] = cell
        }
    }
    this.render = function() {
        var origin = this.being.square
        var plane = origin.plane
        for (var x = this.left; x <= this.right; x++) {
            for (var y = this.top; y <= this.bottom; y++) {
                var square = plane.square(new Coordinate({x: origin.coordinate.x + x, y: origin.coordinate.y + y}))
                var cell = this.cells['_' + x + '_' + y]
                cell.innerHTML = ''
                cell.appendChild(square.span)
            }
        }
    }
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
}

universe = {
    biomes: {
        grass: new Biome({name: 'grass', symbol: '草'}),
        water: new Biome({name: 'water', symbol: '水', passable: 0}),
        void: new Biome({name: 'void', symbol: '無', passable: 0})
    },
    species: {human: new Species({name: 'human', symbol: '人', lean_mass: 10})}
}

initialize = function() {
    var plane = new Plane({width: 256, height: 256})
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
    player.controllers.push(new Controller({being: player}))
    player.viewports.push(new Viewport({being: player, container: document.getElementById('container')}))
    var timeline = new Timeline({start_time: 0, agents: [player, jimmy]})
    timeline.simulate()
}

