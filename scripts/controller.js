function Controller(attributes) {
    this.being = attributes.being;
    this.container = attributes.container
    this.commands = []
    this.command_callbacks = []
    this.partial_command = false
    this.action_chars = {d: actions.drop, e: actions.eat, g: actions.get, l: actions.look, m: actions.magic, n: actions.drink, p: actions.rest, r: actions.read, t: actions.take, u: actions.put, w: actions.wield, '.': actions.wait, ' ': actions.wait, '<': actions.ascend, '>': actions.descend}
    // set up event listeners
    var controller = this
    document.body.addEventListener(
        'keydown',
        function(event) {
            var being = controller.being
            if (event.keyCode == 27) { // esc
                controller.cancel()
            }
            if (event.target.tagName.toLowerCase() != 'input') {
                if (event.keyCode == 37) {
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
            }
        },
        false
    )
    document.body.addEventListener(
        'keypress',
        function(event) {
            if (event.target.tagName.toLowerCase() != 'input') {
                var charStr = String.fromCharCode(event.which || event.keyCode)
                if (controller.partial_command) {
                    var square = controller.being.inventory.get_by_label(charStr)
                    if (square) {
                        controller.click(square)
                        event.preventDefault()
                        return
                    }
                }
                if (charStr == '.' && controller.partial_command) {
                    controller.click(controller.being.square)
                    event.preventDefault()
                } else if (charStr in controller.action_chars) {
                    controller.push_command([controller.action_chars[charStr]])
                    event.preventDefault()
                }
            }
        },
        false
    )
    // set up buttons
    $(this.container).append(
        $('<div />').addClass('panel')
        .append(this.button(actions.drink, 'driNk'))
        .append(this.button(actions.drop, 'Drop'))
        .append(this.button(actions.eat, 'Eat'))
        .append(this.button(actions.get, 'Get'))
        .append(this.button(actions.look, 'Look'))
        .append(this.button(actions.rest, 'sleeP'))
        .append(this.button(actions.put, 'pUt'))
        .append(this.button(actions.read, 'Read'))
        .append(this.button(actions.take, 'Take'))
        .append(this.button(actions.magic, 'use Magic'))
        .append(this.button(actions.wait, 'wait.'))
        .append(this.button(actions.wield, 'Wield'))
        .append(this.button(actions.ascend, '< ascend'))
        .append(this.button(actions.descend, '> descend'))
        .append($('<button />').addClass('action').addClass('cancel').html('cancel <span class="key-label">(esc)</span>').click(function() { controller.cancel() }))
    )

    // set up display
    this.viewport = new PlayerViewport({being: this.being, controller: this, container: this.container})
    this.being.viewports.push(this.viewport)

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
        this.viewport.inventory_viewport.show_labels(this.being, action)
        if (action.dobj == Incantation)
            this.query("\xA0...Enter an incantation")
    }
    else if (partial_command.length == 2) {
        this.being.tell('\xA0...' + action.prep + ' <' + action.iobj.prototype.name + '>')
        this.viewport.inventory_viewport.show_labels(this.being, action, partial_command[1])
    }
}
Controller.prototype.query = function(prompt_string) {
    var controller = this
    var input
    $("<p />").text(prompt_string + ': ')
        .appendTo($("#messages"))
        .append(input = $("<input />")
            .keydown(function(event) {
                if (event.keyCode == 13) { // return
                    this.disabled = true
                    controller.push_command_token(Incantation.create({name: this.value}))
                }
            }))
    input.focus()
}
Controller.prototype.cancel_partial_commands = function() {
    $('#messages input').attr('disabled', 'true')
    this.partial_command = false
    this.viewport.inventory_viewport.hide_labels()
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
        var next_item = false
        if (partial_command.length == 1)
            next_item = action.select_dobj(this.being, square)
        else if (partial_command.length == 2)
            next_item = action.select_iobj(this.being, partial_command[1], square)
        if (typeof(next_item) == "string") {
            this.being.tell(next_item)
            this.cancel_partial_commands()
        } else if (next_item) {
            this.push_command_token(next_item)
        } else if (partial_command.length == 1) {
            this.being.tell("There is nothing there to " + action + ".")
            this.cancel_partial_commands()
        } else if (partial_command.length == 2) {
            this.being.tell("There is nothing there to " + action + " " + partial_command[1].the(this.being) + " " + action.prep + ".")
            this.cancel_partial_commands()
        }
    }
    else if (this.being.square.next_to(square))
        this.push_command([actions.moveto_or_attack, square])

}
// add a token to the partial command
Controller.prototype.push_command_token = function(token) {
    var partial_command = this.partial_command
    partial_command.push(token)
    this.partial_command = false
    this.push_command(partial_command)
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
    if (this.partial_command)
        this.being.tell('\xA0...canceled.')
    this.cancel_partial_commands()
}
