/* 
 * Attack subclasses represent different types of attacks, such as a sword cut or a kick.
 * Instances represent specific events involving an attacker, a target, and possibly a weapon.
 * Damage is calculated when the instance is created, but applied when the .execute() method
 * is invoked. In this way an attacker may observe what the result of an attack would be before
 * deciding whether to execute the attack.
 */

Attack = WorldObject.variant({}, function(attributes) {
    WorldObject.apply(this, arguments)
    // determine whether the attack will hit the target
    if (Math.random() < 0.5)
        this.success = true
    else
        this.success = false
    this.damage = this.damage_base
    if (this.attacker && this.attacker.power) {
        this.damage *= Math.pow(this.attacker.power, this.power_dependence)
    }
    if (this.weapon && this.weapon.sharpness) {
        this.damage *= Math.pow(this.weapon.sharpness, this.sharpness_dependence)
    }
    this.damage *= Math.exp(Probability.gauss() * this.randomness)
})

Attack.prototype.damage_type = 'hit'
Attack.prototype.damage_base = 0.1
Attack.prototype.power_dependence = 1
Attack.prototype.sharpness_dependence = 0
Attack.prototype.randomness = 1
Attack.set_name = 'attacks'

Attack.prototype.execute = function() {
    var verb = english.verbs[this.damage_type]
    if (!this.weapon) {
        this.attacker.tell("You " + this.name + " " + this.target.the() + ".")
        this.target.tell(this.attacker.The() + " " + verb.s + " you.")
        this.attacker.square.announce_all_but([this.target, this.attacker], this.attacker.The() + ' ' + verb.s + ' ' + this.target.the() + '.')
    } else {
        this.attacker.tell("You " + this.name + " " + this.target.the() + " with " + this.weapon.the(this.attacker) + ".")
        this.target.tell(this.attacker.The() + " " + verb.s + " you with " + this.weapon.a(this.target) + ".")
        this.attacker.square.announce_all_but([this.target, this.attacker], this.attacker.The() + ' ' + verb.s + ' ' + this.target.the() + ' with ' + this.weapon.a() + ".")
    }
    this.target.receive_damage(this.damage)
}
