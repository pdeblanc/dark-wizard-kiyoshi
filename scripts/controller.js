function Controller(attributes) {
    this.being = attributes.being;
    this.container = attributes.container
    this.commands = []
    this.command_callbacks = []
    this.partial_command = false
    this.action_chars = {e: actions.eat, g: actions.get, l: actions.look, n: actions.drink, p: actions.rest, u: actions.put, w: actions.wield, '.': actions.wait, ' ': actions.wait, '<': actions.ascend, '>': actions.descend}
    // set up event listeners
    var controller = this
    document.body.addEventListener(
        'keydown',
        function(event) {
            var being = controller.being
            if (event.keyCode == 27) { // esc
                controller.cancel_partial_commands()
            } else if (event.keyCode == 37) {
                controller.click(controller.being.square.west())
                event.preventDefault()
            } else if (event.keyCode == 38) {
                controller.click(controller.being.square.north())
                event.preventDefault()
            } else if (event.keyCode == 39) {
                controller.click(controller.being.square.east())
                event.preventDefault()
            } else if (event.keyCode == 40) {
                controller.click(controller.being.square.south())
                event.preventDefault()
            }
        },
        false
    )
    document.body.addEventListener(
        'keypress',
        function(event) {
            var charStr = String.fromCharCode(event.which || event.keyCode)
            if (controller.being.inventory.labels.length) {
                var square = controller.being.inventory.get_by_label(charStr)
                if (square) {
                    controller.click(square)
                    event.preventDefault()
                }
            }
            if (charStr in controller.action_chars) {
                controller.push_command([controller.action_chars[charStr]])
                event.preventDefault()
            }
        },
        false
    )
    // set up buttons
    $(this.container).append(
        $('<div />').addClass('panel')
        .append(this.button(actions.drink, 'driNk'))
        .append(this.button(actions.eat, 'Eat'))
        .append(this.button(actions.get, 'Get'))
        .append(this.button(actions.look, 'Look'))
        .append(this.button(actions.rest, 'sleeP'))
        .append(this.button(actions.put, 'pUt'))
        .append(this.button(actions.wait, 'wait.'))
        .append(this.button(actions.wield, 'Wield'))
        .append(this.button(actions.ascend, '< ascend'))
        .append(this.button(actions.descend, '> descend'))
    )

    // set up display
    this.being.viewports.push(new PlayerViewport({being: this.being, controller: this, container: this.container}))

    // tell player about controller
    this.being.controllers.push(this)
    universe.players[this.being.id] = this.being
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
    var action = partial_command[0]
    if (partial_command.length == 1) {
        this.being.tell(english.capitalize(partial_command[0].name) + ' <' + action.dobj.prototype.name + '>')
        if (action.dobj == Item)
            this.being.inventory.show_labels()
    }
    else if (partial_command.length == 2) {
        this.being.tell(' ...' + action.prep + ' <' + action.iobj.prototype.name + '>')
        if (action.iobj == Item)
            this.being.inventory.show_labels()
    }
}
Controller.prototype.cancel_partial_commands = function() {
    if (this.partial_command)
        this.being.tell(' ...canceled.')
    this.partial_command = false
    this.being.inventory.hide_labels()
}
Controller.prototype.push_command = function(command) {
    this.cancel_partial_commands()
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
        var action = partial_command[0]
        var target_class = Square
        if (partial_command.length == 1)
            var target_class = action.dobj
        else if (partial_command.length == 2)
            var target_class = action.iobj
        if (target_class == Square) {
            this.partial_command = false
            partial_command.push(square)
            this.push_command(partial_command)
        } else if (target_class == Being) {
            if (square.beings.length) {
                this.partial_command = false
                partial_command.push(square.beings[0])
                this.push_command(partial_command)
            }
        } else if (target_class == Item) {
            if (square.items.length) {
                this.partial_command = false
                partial_command.push(square.items[0])
                this.push_command(partial_command)
            }
        }
    }
    else if (this.being.square.next_to(square))
        this.push_command([actions.moveto_or_attack, square])

}
// button creation method
Controller.prototype.button = function(action, label) {
    var controller = this
    var button = $('<button />').addClass('action')
        .click(function() {
            controller.push_command([action])
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

