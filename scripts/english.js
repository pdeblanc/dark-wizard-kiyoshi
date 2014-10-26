english = {
    verbs: {},
    verb: function(base, s, ed) {
        this.verbs[base] = {
            toString: function() {
                return base
            },
            s: s,
            es: s,
            d: ed,
            ed: ed
        }
        return this
    },
    list: function(array) {
        return array.join(', ')
    }
}

english.verb('cut', 'cuts', 'cut')
    .verb('punch', 'punches', 'punched')
    .verb('hit', 'hits', 'hit')
    .verb('bite', 'bites', 'bit')
    .verb('scratch', 'scratches', 'scratched')
    .verb('burn', 'burns', 'burned')
