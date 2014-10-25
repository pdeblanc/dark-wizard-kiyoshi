universe.affinity = {}

universe.affinity.pairs = {}

universe.affinity.touch = function(tag) {
    if (!(tag in this.pairs))
        this.pairs[tag] = {}
}

universe.affinity.set_affinity = function(a, b, x) {
    this.touch(a)
    this.touch(b)
    this.pairs[a][b] = x
    this.pairs[b][a] = x
}

universe.affinity.friends = function(a, b) {
    this.set_affinity(a, b, 1)
}

universe.affinity.foes = function(a, b) {
    this.set_affinity(a, b, -1)
}

universe.affinity.get = function(a, b) {
    if (!(a in this.pairs))
        return 0;
    if (!(b in this.pairs[a]))
        return 0;
    return this.pairs[a][b]
}
