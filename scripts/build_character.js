function BuildCharacter(container, callback) {
    var attributes = {universe: universe}

    function chain(callbacks) {
        if (callbacks.length) {
            container[0].innerHTML = ''
            callbacks[0](function() {
                chain(callbacks.slice(1))
            })
        }
    }

    function getName(next) {
        var name_input
        container
            .append($('<h1 />').text('Enter your name'))
            .append(name_input = $('<input />').attr('id', 'character-name').keydown(function() {
                if (event.keyCode == 13) { // return key
                    attributes.name = name_input.val()
                    next()
                }
            }))
            .append($('<button />').addClass('continue').text('continue').click(function() {
                attributes.name = name_input.val()
                next()
            }))
        name_input.focus()
    }

    function getClade(next) {
        var clickFunction = function(name) {
            return function() {
                attributes.family = universe.clades[name]
                next()
            }
        }
        var clades_div
        container
            .append($('<h1 />').text('Choose your clade'))
            .append(clades_div = $('<div />'))
        for (var name in universe.clades) {
            clades_div.append(
                $('<div />').addClass('clade-chooser')
                    .append(
                        $('<div />')
                        .addClass(name)
                        .addClass('being')
                        .text(universe.clades[name].prototype.symbol)
                    )
                    .click(clickFunction(name))
                    .append(
                        $('<div />').text(name).addClass(name).addClass('clade-chooser-label')
                    )
            )
        }
    }

    function finish() {
        var player = attributes.family.create(attributes)
        callback(player)
    }

    chain([getName, getClade, finish])

}

