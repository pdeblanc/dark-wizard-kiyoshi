function Controller(attributes) {
    this.being = attributes.being;
    this.container = attributes.container
    this.commands = []
    this.command_callbacks = []
    this.partial_command = false
    this.set_callback = function(callback) {
        if (this.commands.length > 0) {
            command = this.commands.shift()
            return callback(command)
        }
        this.command_callbacks.push(callback)
    }
    this.set_partial_command = function(partial_command) {
        this.partial_command = partial_command
        this.being.tell(english.capitalize(partial_command[0]) + ' <target>')
    }
    this.cancel_partial_commands = function() {
        if (this.partial_command)
            this.being.tell(' ...canceled.')
        this.partial_command = false
    }
    this.push_command = function(command) {
        this.cancel_partial_commands()
        this.commands.push(command)
        if (this.command_callbacks.length > 0) {
            callback = this.command_callbacks.shift()
            command = this.commands.shift()
            return callback(command)
        }
    }
    this.click = function(square) {
        var partial_command = this.partial_command
        if (partial_command) {
            this.partial_command = false
            partial_command.push(square)
            this.push_command(partial_command)
        }
    }
    // tell player about controller
    this.being.controllers.push(this)
    // button creation method
    this.button = function(f, label) {
        var button = $('<button />').addClass('action')
            .click(function() {
                f.apply(controller)
            })
        for (var i = 0; i < label.length; i++) {
            var c = label[i]
            if (c == c.toUpperCase())
                button.append($('<span />').text(c.toLowerCase()).addClass('key-label'))
            else
                button.append($('<span />').text(c))
        }
        return button
    }
    // button functions
    this.cancel = function() {
        this.cancel_partial_commands()
    }
    this.west = function() {
        if (this.partial_command)
            this.click(this.being.square.west())
        else if (this.being.square.west().permit_entry(this.being))
            this.push_command(['west'])
        else
            this.push_command(['attack', this.being.square.west()])
        event.preventDefault()
        return false;
    }
    this.east = function() {
        if (this.partial_command)
            this.click(this.being.square.east())
        else if (this.being.square.east().permit_entry(this.being))
            this.push_command(['east'])
        else
            this.push_command(['attack', this.being.square.east()])
        event.preventDefault()
        return false;
    }
    this.north = function() {
        if (this.partial_command)
            this.click(this.being.square.north())
        else if (this.being.square.north().permit_entry(this.being))
            this.push_command(['north'])
        else
            this.push_command(['attack', this.being.square.north()])
        event.preventDefault()
        return false;
    }
    this.south = function() {
        if (this.partial_command)
            this.click(this.being.square.south())
        else if (this.being.square.south().permit_entry(this.being))
            this.push_command(['south'])
        else
            this.push_command(['attack', this.being.square.south()])
        event.preventDefault()
        return false;
    }
    this.get = function() {
        this.push_command(['get'])
    }
    this.eat = function() {
        this.set_partial_command(['eat'])
    }
    this.wield = function() {
        this.set_partial_command(['wield'])
    }
    this.look = function() {
        this.set_partial_command(['look'])
    }
    this.rest = function() {
        this.push_command(['rest'])
    }
    // set up event listeners
    var controller = this
    document.body.addEventListener(
        'keydown',
        function(event) {
            var being = controller.being
            if (event.keyCode == 27) { // esc
                controller.cancel_partial_commands()
            }
            if (event.keyCode == 37) {
                controller.west()
            }
            if (event.keyCode == 38) {
                controller.north()
            }
            if (event.keyCode == 39) {
                controller.east()
            }
            if (event.keyCode == 40) {
                controller.south()
            }
        },
        false
    )
    document.body.addEventListener(
        'keypress',
        function(event) {
            var charStr = String.fromCharCode(event.which || event.keyCode)
            if (charStr == 'e')
                controller.eat()
            if (charStr == 'g')
                controller.get()
            if (charStr == 'l')
                controller.look()
            if (charStr == 'p')
                controller.rest()
            if (charStr == 'w')
                controller.wield()
        },
        false
    )
    // set up buttons
    $(this.container).append(
        $('<div />').addClass('panel')
        .append(this.button(this.eat, 'Eat'))
        .append(this.button(this.get, 'Get'))
        .append(this.button(this.look, 'Look'))
        .append(this.button(this.rest, 'sleeP'))
        .append(this.button(this.wield, 'Wield'))
    )

    // set up display
    this.being.viewports.push(new PlayerViewport({being: this.being, controller: this, container: this.container}))
}

