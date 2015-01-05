function Timeline(attributes) {
    this.time = attributes.start_time
    this.universe = attributes.universe
    this.queue = new PriorityQueue({comparator: function(a, b) { return a.next_action_time - b.next_action_time }})
}

Timeline.prototype.add_agent = function(agent) {
    agent.next_action_time = agent.next_action_time || this.time + Math.random() * 10 / agent.speed.current()
    this.queue.queue(agent)
}

Timeline.prototype.simulate = function() {
    var agent
    while (agent = this.queue.dequeue()) {
        console.log(this.time, agent.next_action_time)
        this.time = agent.next_action_time
        if (agent.dead || agent.hibernating || !agent.square)
            delete agent.next_action_time
        else if (agent.synchronous()) {
            agent.act()
            agent.next_action_time = this.time + 10 / agent.speed.current()
            if (!agent.hibernating)
                this.queue.queue(agent)
        } else {
            var timeline = this
            agent.act(function() {
                agent.next_action_time = timeline.time + 10 / agent.speed.current()
                timeline.queue.queue(agent)
                timeline.simulate()
            })
            return
        }
        // possibly delay before next event
        if (universe.game_over && (agent = this.queue.peek())) { // only add delays in autoplay mode
            var timeline = this
            var ms = (agent.next_action_time - this.time) * 20
            ms = Math.max(ms, Math.random() < ms)
            if (ms)
                return setTimeout(function() { timeline.simulate() }, ms)
        }
    }
}

