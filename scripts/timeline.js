function Timeline(attributes) {
    this.time = attributes.start_time
    this.universe = attributes.universe
    this.agents = []
    this.queue = new PriorityQueue({comparator: function(a, b) { return a.next_action_time - b.next_action_time }})
    this.add_agent = function(agent) {
        this.agents.push(agent)
        agent.next_action_time = this.time + Math.random() * 10 / agent.speed
        this.queue.queue(agent)
    }
    this.simulate = function() {
        var agent = this.queue.dequeue()
        var ms = (agent.next_action_time - this.time) * 10
        this.time = agent.next_action_time
        var obj = this
        this.universe.delay_if_game_over(ms, function() {
            if (agent.dead)
                obj.simulate()
            else {
                agent.act(function() {
                    agent.next_action_time = obj.time + 10 / agent.speed
                    if (agent.dead == 0)
                        obj.queue.queue(agent)
                    obj.simulate()
                })
            }
        })
    }
}

