function Controller(attributes) {
    this.being = attributes.being;
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
    this.push_command = function(command) {
        if (this.partial_command)
            this.being.tell(' ...canceled.')
        this.partial_command = false
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
    // set up display
    this.being.viewports.push(new PlayerViewport({being: this.being, controller: this}))
    new PlaneViewport({plane: this.being.inventory, controller: this.controller})
    // set up event listeners
    var controller = this
    document.body.addEventListener(
        'keydown',
        function(event) {
            var being = controller.being
            if (event.keyCode == 37) {
                if (controller.partial_command)
                    controller.click(controller.being.square.west())
                else if (controller.being.square.west().permit_entry(being))
                    controller.push_command(['west'])
                else
                    controller.push_command(['attack', controller.being.square.west()])
                event.preventDefault()
                return false;
            }
            if (event.keyCode == 38) {
                if (controller.partial_command)
                    controller.click(controller.being.square.north())
                else if (controller.being.square.north().permit_entry(being))
                    controller.push_command(['north'])
                else
                    controller.push_command(['attack', controller.being.square.north()])
                event.preventDefault()
                return false;
            }
            if (event.keyCode == 39) {
                if (controller.partial_command)
                    controller.click(controller.being.square.east())
                else if (controller.being.square.east().permit_entry(being))
                    controller.push_command(['east'])
                else
                    controller.push_command(['attack', controller.being.square.east()])
                event.preventDefault()
                return false;
            }
            if (event.keyCode == 40) {
                if (controller.partial_command)
                    controller.click(controller.being.square.south())
                else if (controller.being.square.south().permit_entry(being))
                    controller.push_command(['south'])
                else
                    controller.push_command(['attack', controller.being.square.south()])
                event.preventDefault()
                return false;
            }
        },
        false
    )
    document.body.addEventListener(
        'keypress',
        function(event) {
            var charStr = String.fromCharCode(event.which || event.keyCode)
            if (charStr == 'g')
                controller.push_command(['get'])
            if (charStr == 'l')
                controller.set_partial_command(['look'])
        },
        false
    )
}

