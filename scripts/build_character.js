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
                    attributes.proper_name = name_input.val()
                    next()
                }
            }))
            .append($('<button />').addClass('continue').text('continue').click(function() {
                attributes.proper_name = name_input.val()
                next()
            }))
        name_input.focus()
    }

    function getClade(next) {
        attributes.family = universe.clades.human
        next()
    }

    function finish() {
        var player = attributes.family.create(attributes)
        callback(player)
    }

    chain([getName, getClade, finish])

}

