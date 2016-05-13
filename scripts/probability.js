Probability = {};

// Take a list of ordered pairs [outcome, unscaled_probability] and return a sample
Probability.sample = function(list, seed) {
    var total = 0;
    var i;
    for (i = 0; i < list.length; i++)
        total += list[i][1];
    var R = Probability.srandom(seed) * total;
    for (i = 0; i < list.length; i++) {
        if (R < list[i][1])
            return list[i][0];
        R -= list[i][1];
    }
    return list[0][0];
};

Probability.gauss = function() {
    var x, y, mag2;
    do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
    } while ((mag2 = x * x + y * y) > 1);
    return Math.sqrt(-2 * Math.log(mag2) / mag2) * x;
};

Probability.hash_int = function (x) {
    return murmurhash2_32_gc('' + x, 1234);
};

Probability.srandom = function(seed) {
    return Probability.hash_int(seed) / Math.pow(2, 32);
};
