/* 
 * Attack subclasses represent different types of attacks, such as a sword cut or a kick.
 * Instances represent specific events involving an attacker, a target, and possibly a weapon.
 * Damage is calculated when the instance is created, but applied when the .execute() method
 * is invoked. In this way an attacker may observe what the result of an attack would be before
 * deciding whether to execute the attack.
 */

Attack = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    this.randomness *= this.__proto__.randomness
    this.damage = this.damage_base
    if (this.attacker && this.attacker.power) {
        this.damage *= Math.pow(this.attacker.power, this.power_dependence)
    }
    if (this.weapon && this.weapon.sharpness) {
        this.damage *= Math.pow(this.weapon.sharpness, this.sharpness_dependence)
    }
    this.damage *= Math.exp(this.randomness * (Probability.gauss() * this.tactical_randomness + this.damage_bonus))
    // some attacks will fail entirely
    var miss_chance = 0.5
    if (jStat.normal(0, 1).cdf(Probability.gauss() * this.tactical_randomness + this.to_hit_bonus) <= miss_chance && this.randomness > 0)
        this.damage = 0
})

Attack.prototype.damage_type = 'hit'
Attack.prototype.damage_base = 0.1
Attack.prototype.power_dependence = 1
Attack.prototype.sharpness_dependence = 0
Attack.prototype.randomness = 0.25 // This is a STANDARD DEVIATION
Attack.prototype.tactical_randomness = 0
Attack.prototype.damage_bonus = 0 // should only be set by constructor -- situational
Attack.prototype.to_hit_bonus = 0 // only set by constructor -- situational
Attack.set_name = 'attacks'

Attack.prototype.execute = function() {
    var verb = english.verbs[this.damage_type]
    if (this.damage <= 0)
        verb = english.verbs.miss
    var damage_string = ""
    if (this.damage > 0)
        damage_string = " for " + this.damage + " damage"
    if (!this.weapon) {
        this.attacker.tell("You " + verb + " " + this.target.the() + damage_string + ".")
        this.target.tell(this.attacker.The() + " " + verb.s + " you" + damage_string + ".")
        this.attacker.square.announce_all_but([this.target, this.attacker], this.attacker.The() + ' ' + verb.s + ' ' + this.target.the() + damage_string + ".")
    } else {
        this.attacker.tell("You " + verb + " " + this.target.the() + " with " + this.weapon.the(this.attacker) + damage_string + ".")
        this.target.tell(this.attacker.The() + " " + verb.s + " you with " + this.weapon.a(this.target) + damage_string + ".")
        this.attacker.square.announce_all_but([this.target, this.attacker], this.attacker.The() + ' ' + verb.s + ' ' + this.target.the() + ' with ' + this.weapon.a() + damage_string + ".")
    }
    this.target.receive_damage(this.damage)
}
