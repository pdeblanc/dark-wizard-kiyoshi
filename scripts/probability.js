Probability = {}

// Take a list of ordered pairs [outcome, unscaled_probability] and return a sample
Probability.sample = function(list) {
    var total = 0
    for (var i = 0; i < list.length; i++)
        total += list[i][1]
    var R = Math.random() * total
    for (var i = 0; i < list.length; i++) {
        if (R < list[i][1])
            return list[i][0]
        R -= list[i][1]
    }
    return list[0][0]
}

