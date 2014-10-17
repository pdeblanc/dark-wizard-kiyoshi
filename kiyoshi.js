function Plane(attributes) {
    this.width = 256
    this.height = 256
    this.squares = {}
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.squares['_' + x + '_' + y] = new Square({biome: universe.biomes.grass, plane: this, coordinate: new Coordinate({x: x, y: y})})
        }
    }
    this.square = function(coordinate) {
        if (coordinate.x < 0 || coordinate.y < 0 || coordinate.x >= this.width || coordinate.y >= this.height)
            return new Square({biome: universe.biomes.void, plane: this, coordinate: coordinate})
        return this.squares['_' + coordinate.x + '_' + coordinate.y]
    }
}

function Timeline(attributes) {
    this.time = 0
    this.agents = attributes.agents
    this.queue = new PriorityQueue()
    for (var i = 0; i < this.agents.length; i++)
        this.queue.push(this.agents[i], Math.random())
    this.simulate = function() {
        var event = this.queue.pop()
        this.time = -event.priority
        var obj = this
        event.data.act(function() {obj.simulate()})
    }
}

function Square(attributes) {
    this.biome = attributes.biome
    this.div = document.createElement('div')
    this.div.className = 'biome ' + this.biome.name
    this.div.textContent = this.biome.symbol
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
            this.div.innerHTML = ''
            this.div.appendChild(this.contents[0].div)
        }
        else
            this.div.innerHTML = this.biome.symbol
    }
    this.enter = function(newcomer) {
        this.contents.push(newcomer)
        this.div.innerHTML = ''
        this.div.appendChild(newcomer.div)
    }
}

function Biome(attributes) {
    this.name = attributes.name
    this.symbol = attributes.symbol
}

function Being(attributes) {
    this.species = universe.species.human
    this.symbol = this.species.symbol
    this.div = document.createElement('div')
    this.div.className = this.species.name
    this.div.textContent = this.symbol
    this.square = attributes.square
    this.square.contents.push(this)
    this.square.div.innerHTML = ''
    this.square.div.appendChild(this.div)
    this.viewports = []
    this.controllers = []
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
        this.controllers[0].set_callback(function(command) {
            obj.execute_command(command)
            callback() 
        })
    }
    this.moveto = function(square) {
        this.square.exit(this)
        this.square = square
        this.square.enter(this)
    }
}

function Species(attributes) {
    this.name = attributes.name
    this.symbol = attributes.symbol
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
    this.container = attributes.container
    this.being.div.className += ' player'
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
            var cell = document.createElement('div')
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
                cell.appendChild(square.div)
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
        void: new Biome({name: 'void', symbol: '無'})
    },
    species: {human: new Species({name: 'human', symbol: '人'})}
}

initialize = function() {
    var plane = new Plane()
    var player = new Being({
        species: universe.species.human,
        square: plane.square(
            new Coordinate({
                x: 2,
                y: 3
            })
        )
    })
    player.controllers.push(new Controller({being: player}))
    player.viewports.push(new Viewport({being: player, container: document.getElementById('container')}))
    var timeline = new Timeline({agents: [player]})
    timeline.simulate()
}
