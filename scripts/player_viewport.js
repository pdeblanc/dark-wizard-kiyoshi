function PlayerViewport(attributes) {
    this.being = attributes.being
    this.controller = attributes.controller
    $("#profile")
        .append(
            $("<div />")
                .append(
                    $("<span />")
                        .attr("id", "name")
                        .text("Peter")
                )
                .append(
                    $("<span />")
                        .text(" the ")
                )
                .append(
                    $("<span />")
                        .attr("id", "title")
                        .text(this.being.family.name)
                        .addClass(this.being.family.name)
                )
        )
        .append(
            $("<div />")
                .attr("id", "stats")
        )
    this.being.span.className += ' player'
    this.left = -4
    this.right = 4
    this.top = -4
    this.bottom = 4
    for (var y = this.top; y <= this.bottom; y++) {
        var row = $("<div />").addClass("row")
        $("#viewport").append(row)
        for (var x = this.left; x <= this.right; x++) {
            row.append(viewportCell("_" + x + "_" + y, this.controller))
        }
    }
    this.render = function() {
        var stats_div = document.getElementById('stats')
        stats_div.innerHTML = ''
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
            stats_div.appendChild(stat_div)
        }
        $(stats_div).append(
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

