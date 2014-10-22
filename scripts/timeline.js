function Timeline(attributes) {
    this.time = attributes.start_time
    this.agents = attributes.agents
    this.queue = new PriorityQueue({comparator: function(a, b) { return a.next_action_time - b.next_action_time }})
    for (var i = 0; i < this.agents.length; i++) {
        this.agents[i].next_action_time = this.time + Math.random() * 10 / this.agents[i].speed
        this.queue.queue(this.agents[i])
    }
    this.simulate = function() {
        var agent = this.queue.dequeue()
        this.time = agent.next_action_time
        var obj = this
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
    }
}

