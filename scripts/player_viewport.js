VIEWPORT_WIDTH = 9
VIEWPORT_HEIGHT = 9

function PlayerViewport(attributes) {
    this.being = attributes.being
    this.controller = attributes.controller
    this.container = attributes.container
    this.messages = []

    var profile_element, name_element, title_element, map_element, region_element
    
    $(container)
        .append($('<div />').attr('id', 'profile').addClass('panel')
            .append($("<div />")
                .append(name_element = $("<span />"))
                .append($("<span />").text(" the "))
                .append(title_element = $("<span />"))
            )
            .append(region_element = $("<div />").attr('id', 'region'))
            .append(this.stats_element = $("<div />")))
        .append(map_element = $('<div />').addClass('panel'))
        .append(this.inventory_element = $('<div />').addClass('panel'))
        .append($('<div></div>').attr('id', 'messages'))
    this.inventory_viewport = new PlaneViewport({plane: this.being.inventory, controller: this.controller, container: this.inventory_element})
    this.left = (1 - VIEWPORT_WIDTH) / 2
    this.right = (VIEWPORT_WIDTH - 1) / 2
    this.top = (1 - VIEWPORT_HEIGHT) / 2
    this.bottom = (VIEWPORT_HEIGHT - 1) / 2
    for (var y = this.top; y <= this.bottom; y++) {
        var row = $("<div />").addClass("row")
        map_element.append(row)
        for (var x = this.left; x <= this.right; x++) {
            row.append(viewportCell("_" + x + "_" + y, this.controller))
        }
    }
    this.render_profile = function() {
        name_element.text(this.being.name).attr("id", "name")
        title_element.text(this.being.__proto__.name).attr("class", this.being.className)
        region_element.text("Region " + this.being.square.plane.level)
    }
}

PlayerViewport.prototype.tell = function(message) {
    var messages_div = document.getElementById("messages")
    var i
    if ((i = this.messages.length - 1) >= 0 && this.messages[i].text == message) {
        this.messages[i].count += 1
        this.messages[i].p.textContent = message + ' <' + this.messages[i].count + 'x>'
    } else {
        var p = document.createElement('p')
        p.textContent = message
        this.messages.push({p: p, text: message, count: 1})
        messages_div.appendChild(p)
    }
    messages_div.scrollTop = messages_div.scrollHeight
}

PlayerViewport.prototype.render = function() {
    this.inventory_viewport.render()
    this.render_profile()
    this.stats_element[0].innerHTML = ''
    for (var i = 0; i < PUBLIC_STATS.length; i++) {
        var stat_div = document.createElement('div')
        var stat_label = document.createElement('span')
        stat_label.textContent = PUBLIC_STATS[i] + ': '
        var stat_value = document.createElement('span')
        stat_value.className = 'stat-value'
        stat_value.id = PUBLIC_STATS[i]
        if (PUBLIC_STATS[i] == 'magic')
            stat_value.textContent = Math.floor(this.being.magic * this.being.energy) + '/' + Math.floor(this.being.magic)
        else
            stat_value.textContent = Math.floor(this.being[PUBLIC_STATS[i]])
        stat_div.appendChild(stat_label)
        stat_div.appendChild(stat_value)
        this.stats_element.append(stat_div)
    }
    this.stats_element.append(
        $("<div />").text("Body fat: " + (''+this.being.body_fat).substring(0,5))
    )
    var origin = this.being.square
    var plane = origin.plane
    for (var x = this.left; x <= this.right; x++) {
        for (var y = this.top; y <= this.bottom; y++) {
            var square = plane.square(new Coordinate({x: origin.coordinate.x + x, y: origin.coordinate.y + y}))
            var cell = $('#_' + x + '_' + y)
            square.blit(this.being, cell)
        }
    }
    $(".item").draggable({ opacity: 0.7, helper: "clone"})
}

PlayerViewport.prototype.set_being = function(being) {
    this.being = being
    this.inventory_viewport = new PlaneViewport({plane: this.being.inventory, controller: this.controller, container: this.inventory_element})
    being.viewports.push(this)
    universe.players[being.id] = being
    being.disturb()
    being.disturb_others()
}
