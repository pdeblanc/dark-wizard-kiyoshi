function BuildCharacter(container, callback) {
    var attributes = {universe: universe};

    function chain(callbacks) {
        if (callbacks.length) {
            container[0].innerHTML = '';
            callbacks[0](function() {
                chain(callbacks.slice(1));
            });
        }
    }

    function getName(next) {
        var name_input, world_name_input;
        function advance() {
            attributes.name = name_input.val();
            if (attributes.name == '茅場晶彦')
                attributes.cheater = true;
            universe.seed = world_name_input.val();
            next();
        }
        container
            .append($('<h1 />').text('Enter your name'))
            .append(name_input = $('<input />').attr('id', 'character-name').keydown(function(event) {
                if (event.keyCode == 13) { // return key
                    advance();
                }
            }))
            .append($('<h2 />').text('World name (random seed)'))
            .append(world_name_input = $('<input />').attr('id', 'world-name').val("chikyū-" + Math.floor(Math.random() * 1000)).keydown(function(event) {
                if (event.keyCode == 13) { // return key
                    advance();
                }
            }))
            .append($('<button />').addClass('continue').text('continue').click(function(event) {
                advance();
            }));
        name_input.focus();
    }

    function getClade(next) {
        var clickFunction = function(name) {
            return function() {
                attributes.family = universe.clades[name];
                next();
            };
        };
        var clades_div;
        container
            .append($('<h1 />').text('Choose your clade'))
            .append(clades_div = $('<div />'));
        for (var name in universe.clades) {
            if (universe.clades[name].prototype.playable || attributes.cheater) {
                clades_div.append(
                    $('<div />').addClass('clade-chooser')
                        .append(
                            $('<div />')
                            .addClass(universe.clades[name].prototype.className)
                            .addClass('being')
                            .text(universe.clades[name].prototype.symbol)
                        )
                        .click(clickFunction(name))
                        .append(
                            $('<div />').text(name).addClass(universe.clades[name].prototype.className).addClass('clade-chooser-label')
                        )
                );
            }
        }
    }

    function finish() {
        var player = attributes.family.create(attributes);
        callback(player);
    }

    chain([getName, getClade, finish]);

}

