function Timeline(attributes) {
    this.time = attributes.start_time
    this.universe = attributes.universe
    this.queue = new PriorityQueue({comparator: function(a, b) { return a.next_action_time - b.next_action_time }})
}

Timeline.prototype.add_agent = function(agent) {
    agent.next_action_time = this.time + Math.random() * 10 / agent.speed.current()
    this.queue.queue(agent)
}
Timeline.prototype.simulate = function() {
    var agent = this.queue.dequeue()
    var ms = (agent.next_action_time - this.time) * 20
    this.time = agent.next_action_time
    var obj = this
    this.universe.delay_if_game_over(ms, function() {
        if (agent.dead || agent.hibernating) {
            delete agent.next_action_time
            obj.simulate()
        } else {
            agent.act(function() {
                agent.next_action_time = obj.time + 10 / agent.speed.current()
                if (agent.dead == 0)
                    obj.queue.queue(agent)
                obj.simulate()
            })
        }
    })
}

