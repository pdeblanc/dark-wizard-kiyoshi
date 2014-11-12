function viewportCell(id, controller) {
    return $("<span />")
        .addClass("cell")
        .attr("id", id)
        .droppable({
            accept: ".item",
            hoverClass: "drag-target",
            drop: function(event, ui) {
                var item = ui.draggable[0].item
                var square = this.square
                controller.push_command([actions.put, item, square])
            }
        })
        .disableSelection()
        .dblclick(function() {
            var children = this.getElementsByClassName('item');
            var action, item
            for (var i = 0; i < children.length; i++) {
                if ((item = children[i].item) && (action = item.default_action())) {
                    return controller.push_command([action, children[i].item])
                }
            }
        })
        .click(function() {
            controller.click(this.square)
        })
}

function centralizer(element) {
    return $("<div />").addClass("centralizer-outer").append($("<div />").addClass("centralizer-inner").append(element))
}
