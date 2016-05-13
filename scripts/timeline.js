function Timeline(attributes) {
    this.time = attributes.start_time;
    this.universe = attributes.universe;
    this.queue = new PriorityQueue({comparator: function(a, b) { return a.time - b.time; }});
}

Timeline.prototype.add_agent = function(agent) {
    agent.next_action_time = agent.next_action_time || this.time + Math.random() * 10 / agent.speed.current();
    this.queue_action(agent);
};

// agent.next_action_time is mutable but the priority queue expects immutable priorities
Timeline.prototype.queue_action = function(agent) {
    this.queue.queue({agent: agent, time: agent.next_action_time});
};

Timeline.prototype.simulate = function() {
    var agent;
    var timeline = this;
    function agent_act_callback() {
        agent.next_action_time = timeline.time + 10 / agent.speed.current();
        timeline.queue_action(agent);
        timeline.simulate();
    }
    function simulate_timeline() {
        timeline.simulate();
    }
    while (action = this.queue.dequeue()) {
        agent = action.agent;
        if (action.time != agent.next_action_time)
            continue;
        this.time = agent.next_action_time;
        if (agent.dead || agent.hibernating || !agent.square)
            delete agent.next_action_time;
        else if (agent.synchronous()) {
            agent.act();
            if (!agent.hibernating) {
                agent.next_action_time = this.time + 10 / agent.speed.current();
                this.queue_action(agent);
            }
        } else {
            agent.act(agent_act_callback);
            return;
        }
        // possibly delay before next event
        if (universe.game_over && (agent = this.queue.peek())) { // only add delays in autoplay mode
            var ms = (agent.next_action_time - this.time) * 20;
            ms = Math.max(ms, Math.random() < ms);
            return setTimeout(simulate_timeline, ms);
        }
    }
};
