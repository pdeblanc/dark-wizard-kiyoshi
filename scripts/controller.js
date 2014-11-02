function Controller(attributes) {
    this.being = attributes.being;
    this.container = attributes.container
    this.commands = []
    this.command_callbacks = []
    this.partial_command = false
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
                controller.push_command([actions.west])
                event.preventDefault()
            }
            if (event.keyCode == 38) {
                controller.push_command([actions.north])
                event.preventDefault()
            }
            if (event.keyCode == 39) {
                controller.push_command([actions.east])
                event.preventDefault()
            }
            if (event.keyCode == 40) {
                controller.push_command([actions.south])
                event.preventDefault()
            }
        },
        false
    )
    document.body.addEventListener(
        'keypress',
        function(event) {
            var charStr = String.fromCharCode(event.which || event.keyCode)
            if (charStr == 'e')
                controller.push_command([actions.eat])
            if (charStr == 'g')
                controller.push_command([actions.get])
            if (charStr == 'l')
                controller.push_command([actions.look])
            if (charStr == 'p')
                controller.push_command([actions.rest])
            if (charStr == 'w')
                controller.push_command([actions.wield])
            if (charStr == '.' || charStr == ' ') {
                controller.push_command([actions.wait])
                event.preventDefault()
            }
        },
        false
    )
    // set up buttons
    $(this.container).append(
        $('<div />').addClass('panel')
        .append(this.button(actions.eat, 'Eat'))
        .append(this.button(actions.get, 'Get'))
        .append(this.button(actions.look, 'Look'))
        .append(this.button(actions.rest, 'sleeP'))
        .append(this.button(actions.wait, 'wait.'))
        .append(this.button(actions.wield, 'Wield'))
    )

    // set up display
    this.being.viewports.push(new PlayerViewport({being: this.being, controller: this, container: this.container}))

    // tell player about controller
    this.being.controllers.push(this)
}

Controller.prototype.set_callback = function(callback) {
    if (this.commands.length > 0) {
        command = this.commands.shift()
        return callback(command)
    }
    this.command_callbacks.push(callback)
}
Controller.prototype.set_partial_command = function(partial_command) {
    this.partial_command = partial_command
    this.being.tell(english.capitalize(partial_command[0].name) + ' <target>')
}
Controller.prototype.cancel_partial_commands = function() {
    if (this.partial_command)
        this.being.tell(' ...canceled.')
    this.partial_command = false
}
Controller.prototype.push_command = function(command) {
    this.cancel_partial_commands()
    console.log(command[0].name)
    if (command[0].dobj && command.length < 2 || command[0].iobj && command.length < 3)
        return this.set_partial_command(command)
    this.commands.push(command)
    if (this.command_callbacks.length > 0) {
        callback = this.command_callbacks.shift()
        command = this.commands.shift()
        return callback(command)
    }
}
Controller.prototype.click = function(square) {
    var partial_command = this.partial_command
    if (partial_command) {
        this.partial_command = false
        partial_command.push(square)
        this.push_command(partial_command)
    }
}
// button creation method
Controller.prototype.button = function(action, label) {
    var controller = this
    var button = $('<button />').addClass('action')
        .click(function() {
            controller.push_command([f])
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
Controller.prototype.cancel = function() {
    this.cancel_partial_commands()
}

