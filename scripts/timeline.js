function Timeline(attributes) {
    this.time = attributes.start_time
    this.universe = attributes.universe
    this.queue = new PriorityQueue({comparator: function(a, b) { return a.time - b.time }})
}

Timeline.prototype.add_agent = function(agent) {
    agent.next_action_time = agent.next_action_time || this.time + Math.random() * 10 / agent.speed.current()
    this.queue_action(agent)
}

// agent.next_action_time is mutable but the priority queue expects immutable priorities
Timeline.prototype.queue_action = function(agent) {
    this.queue.queue({agent: agent, time: agent.next_action_time})
}

Timeline.prototype.simulate = function() {
    var agent
    while (action = this.queue.dequeue()) {
        var agent = action.agent
        if (action.time != agent.next_action_time)
            continue
        this.time = agent.next_action_time
        if (agent.dead || agent.hibernating || !agent.square)
            delete agent.next_action_time
        else if (agent.synchronous()) {
            agent.act()
            if (!agent.hibernating) {
                agent.next_action_time = this.time + 10 / agent.speed.current()
                this.queue_action(agent)
            }
        } else {
            var timeline = this
            agent.act(function() {
                agent.next_action_time = timeline.time + 10 / agent.speed.current()
                timeline.queue_action(agent)
                timeline.simulate()
            })
            return
        }
        // possibly delay before next event
        if (universe.game_over && (agent = this.queue.peek())) { // only add delays in autoplay mode
            var timeline = this
            var ms = (agent.next_action_time - this.time) * 20
            ms = Math.max(ms, Math.random() < ms)
            return setTimeout(function() { timeline.simulate() }, ms)
        }
    }
}

