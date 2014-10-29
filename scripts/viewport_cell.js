function viewportCell(id, controller) {
    return $("<span />")
        .addClass("cell-container")
        .append(
            $("<div />")
            .addClass("cell")
            .attr("id", id)
            .droppable({
                accept: ".item",
                hoverClass: "drag-target",
                drop: function(event, ui) {
                    var item = ui.draggable[0].item
                    var square = this.childNodes[0].square
                    item.moveto(square)
                }
            })
            .disableSelection()
        )
        .dblclick(function() {
            var children = this.getElementsByClassName('item');
            var action, item
            for (var i = 0; i < children.length; i++) {
                if ((item = children[i].item) && (action = item.default_action())) {
                    return controller.push_command([action, children[i].item.square])
                }
            }
        })
        .click(function() {
            controller.click(this.childNodes[0].childNodes[0].square)
        })
}

