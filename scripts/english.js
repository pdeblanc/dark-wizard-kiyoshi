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
    }
}

english.verb('cut', 'cuts', 'cut')
    .verb('punch', 'punches', 'punched')
    .verb('hit', 'hits', 'hit')
