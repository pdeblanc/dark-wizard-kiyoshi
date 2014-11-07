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
    list: function(array, nothing, connective) {
        connective = connective || "and"
        if (array.length == 0)
            return (nothing || "nothing")
        if (array.length == 1)
            return array[0]
        if (array.length == 2)
            return [array[0], connective, array[1]].join(" ")
        return array.slice(0, array.length - 1).join(", ") + (", " + connective + " " + array[array.length-1])
    },
    capitalize: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }
}

english.verb('cut', 'cuts', 'cut')
    .verb('punch', 'punches', 'punched')
    .verb('hit', 'hits', 'hit')
    .verb('bite', 'bites', 'bit')
    .verb('scratch', 'scratches', 'scratched')
    .verb('burn', 'burns', 'burned')
    .verb('slap', 'slaps', 'slapped')
    .verb('peck', 'pecks', 'pecked')
    .verb('kick', 'kicks', 'kicked')
    .verb('stab', 'stabs', 'stabbed')
    .verb('shoot', 'shoots', 'shot')

