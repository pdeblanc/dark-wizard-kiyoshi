function PlayerViewport(attributes) {
    this.being = attributes.being
    this.controller = attributes.controller
    this.container = attributes.container

    var profile_element, name_element, title_element, stats_element, map_element, inventory_element
    
    $(container)
        .append($('<div />').attr('id', 'profile').addClass('panel')
            .append($("<div />")
                .append(name_element = $("<span />"))
                .append($("<span />").text(" the "))
                .append(title_element = $("<span />"))
            )
            .append(stats_element = $("<div />")))
        .append(map_element = $('<div />').addClass('panel'))
        .append(inventory_element = $('<div />').addClass('panel'))
        .append($('<textarea></textarea>').attr('id', 'messages'))
    new PlaneViewport({plane: this.being.inventory, controller: this.controller, container: inventory_element})
    this.being.span.className += ' player'
    this.left = -4
    this.right = 4
    this.top = -4
    this.bottom = 4
    for (var y = this.top; y <= this.bottom; y++) {
        var row = $("<div />").addClass("row")
        map_element.append(row)
        for (var x = this.left; x <= this.right; x++) {
            row.append(viewportCell("_" + x + "_" + y, this.controller))
        }
    }
    this.render_profile = function() {
        name_element.text(this.being.name).attr("id", "name")
        title_element.text(this.being.family.name).attr("class", this.being.family.name)
    }
    this.render = function() {
        this.render_profile()
        stats_element[0].innerHTML = ''
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
            stats_element.append(stat_div)
        }
        stats_element.append(
            $("<div />").text("Body fat: " + (''+this.being.body_fat).substring(0,5))
        )
        var origin = this.being.square
        var plane = origin.plane
        for (var x = this.left; x <= this.right; x++) {
            for (var y = this.top; y <= this.bottom; y++) {
                var square = plane.square(new Coordinate({x: origin.coordinate.x + x, y: origin.coordinate.y + y}))
                $('#_' + x + '_' + y).html('').append(square.span)
            }
        }
        $(".item").draggable({ opacity: 0.7, helper: "clone"})
    }
    this.tell = function(message) {
        var textArea = document.getElementById("messages")
        textArea.textContent += message + '\n'
        textArea.scrollTop = textArea.scrollHeight;
    }
}

