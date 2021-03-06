PUBLIC_STATS = ['power', 'speed', 'vigor', 'magic', 'tactics', 'level', 'experience'];
STATS = ['power', 'speed', 'vigor', 'lean_weight'];

Condition
    .kingdom({name: 'empowerment', power_bonus: 5, duration: 50, activation_message: "You feel empowered!", deactivation_message: "The empowerment has worn off."})
    .kingdom({name: 'acceleration', speed_bonus: 5, duration: 50, activation_message: "You feel accelerated!", deactivation_message: "The acceleration has worn off."})
    .kingdom({name: 'invigoration', vigor_bonus: 5, duration: 50, activation_message: "You feel invigorated!", deactivation_message: "The invigoration has worn off."})
    .kingdom({name: 'xray_vision', xray_vision_bonus: 5, duration: 50, activation_message: "You gain the ability to see through objects!", deactivation_message: "The X-ray vision has worn off."});

Attack
    .kingdom({name: 'hit', damage_type: 'hit'})
    .kingdom({name: 'buffet', damage_type: 'buffet'})
    .kingdom({name: 'bokutō_hit', damage_type: 'hit', damage_base: 0.2})
    .kingdom({name: 'punch', damage_type: 'punch', sound: 'punch'})
    .kingdom({name: 'kick', damage_type: 'kick', sound: 'punch'})
    .kingdom({name: 'cut', damage_type: 'cut', sharpness_dependence: 1, sound: 'cut'})
    .kingdom({name: 'claw', damage_type: 'claw'})
    .kingdom({name: 'bite', damage_type: 'bite'})
    .kingdom({name: 'slap', damage_type: 'slap'})
    .kingdom({name: 'stab', damage_type: 'stab', sharpness_dependence: 1, sound: 'stab'})
    .kingdom({name: 'burn', damage_type: 'burn', damage_base: 0.3})
    .kingdom({name: 'choke', damage_type: 'choke', damage_base: 0.3})
    .kingdom({name: 'peck', damage_type: 'peck'})
    .kingdom({name: 'trample', damage_type: 'trample'})
    .kingdom({name: 'ram', damage_type: 'ram'})
    .kingdom({name: 'zap', damage_type: 'zap', damage_base: 4, power_dependence: 0, sound: 'zap'});

Item.prototype.attacks = [universe.attacks.hit];
Item
    .kingdom({name: 'katana', symbol: '刀', action: actions.toggle_wield, attacks: [universe.attacks.cut, universe.attacks.stab], sharpness: 5, level: 3, hands: 2, habitat: {samurai: 2.5}})
        .phylum({name: 'bokutō', sharpness: 2, level: 1, attacks: [universe.attacks.bokutō_hit]})
    .kingdom({name: 'sword', symbol: '剣', action: actions.toggle_wield, attacks: [universe.attacks.cut, universe.attacks.stab], sharpness: 5, generic: true, level: 3})
        .phylum({name: 'longsword', symbol: '剣', hands: 2})
        .phylum({name: 'rapier', symbol: '剣'})
    .kingdom({name: 'meat', symbol: '肉', stackable: true, count_mean: 3, count_oom_variance: 0.2, fat: 1, action: actions.eat, attacks: [universe.attacks.slap]})
    .kingdom({name: 'ash', symbol: '灰', bias: -10})
    .kingdom({name: 'iron', symbol: '鉄', bias: -10})
    .kingdom({name: 'tea', symbol: '茶', action: actions.drink, drinkable: true, generic: true, random_effects: [effects.healing, effects.empowerment, effects.poison, effects.acceleration, effects.invigoration, effects.xray_vision]})
        .phylum({name: 'green tea'})
        .phylum({name: 'black tea'})
        .phylum({name: 'thai iced tea'})
        .phylum({name: 'pu-erh tea'})
        .phylum({name: 'white tea'})
    .kingdom({name: 'bean', symbol: '豆', action: actions.eat, fat: 1, generic: true})
        .phylum({name: 'soybean'})
        .phylum({name: 'azuki bean'})
        .phylum({name: 'black bean'})
    .kingdom({name: 'cooked rice', symbol: '飯', action: actions.eat, fat: 1, generic: true})
        .phylum({name: 'bowl of cooked white rice'})
    .kingdom({name: 'fruit', symbol: '果', action: actions.eat, fat: 1, generic: true})
        .phylum({name: 'apple'})
        .phylum({name: 'lemon'})
        .phylum({name: 'lime'})
        .phylum({name: 'orange'})
    .kingdom({name: 'potato', symbol: '芋', action: actions.eat, fat: 1, generic: false})
    .kingdom({name: 'book', symbol: '本', action: actions.read, generic: true})
        .phylum({name: 'book of spells', text: "'Power': level 1 spell. Incantation: 'chikara'"})
    .kingdom({name: 'yen', symbol: '円', bias: -3, stackable: true, count_mean: 10, count_oom_variance: 0.5})
    .kingdom({name: 'torch', symbol: '灯', level: 1, luminosity: 10, attacks: [universe.attacks.burn]});

Being
    .kingdom({name: 'animal', generic: true, bias: -5, corpse: universe.products.meat})
        .phylum({name: 'human', symbol: '人', lean_weight: 100, hands: 2, tactics: 10, magic: 2, attacks: [universe.attacks.punch, universe.attacks.kick], inventory: {width: 2, height: 9}, level: 0.5, playable: true, bias: -6, habitat: {town: 2}, power: 10, speed: 10, vigor: 10})
            .clazz({name: 'samurai', symbol: '侍', tactics: 12, power: 15, vigor: 14, speed: 13, playable: false, level: 2})
            .clazz({name: 'child', symbol: '子', power: 6, vigor: 6, playable: false})
        .phylum({name: 'monkey', symbol: '猿', lean_weight: 60, hands: 2, tactics: 10, attacks: [universe.attacks.slap, universe.attacks.kick], inventory: {width: 2, height: 3}, level: 0.5, playable: true, bias: -6, power: 10, speed: 12, vigor: 10})
        .phylum({name: 'three-clawed dragon', symbol: '竜', hands: 2, lean_weight: 10000, power: 100, vigor: 100, attacks: [universe.attacks.claw], can_fly: true, inventory: {width: 1, height: 3}, level: 50})
            .clazz({name: 'four-clawed dragon', symbol: '龍', lean_weight: 20000, vigor: 141, power: 141, level: 100})
                .order({name: 'five-clawed dragon', symbol: '龍', lean_weight: 40000, vigor: 200, power: 141, level: 210})
        .phylum({name: 'cat', symbol: '猫', lean_weight: 10, vigor: 3, power: 3, attacks: [universe.attacks.claw], playable: true, level: 0.15})
        .phylum({name: 'dog', symbol: '犬', lean_weight: 30, vigor: 5, power: 5, attacks: [universe.attacks.bite], playable: true, level: 0.25, generic: true})
            .clazz({name: 'golden retriever', lean_weight: 50, vigor: 7, power: 7, level: 0.35})
            .clazz({name: 'rottweiler', lean_weight: 80, vigor: 9, power: 9, level: 0.4})
        .phylum({name: 'fox', symbol: '狐', lean_weight: 20, vigor: 4, power: 4, speed: 15, attacks: [universe.attacks.bite], playable: true, level: 0.25, generic: true})
            .clazz({name: 'white fox', generic: false})
        .phylum({name: 'mouse', symbol: '鼠', lean_weight: 0.1, vigor: 0.3, speed: 30, power: 0.3, attacks: [universe.attacks.bite], level: 0.0045})
            .clazz({name: 'rat', symbol: '鼠', lean_weight: 1, vigor: 1, speed: 20, power: 1, level: 0.02})
        .phylum({name: 'bird', symbol: '鳥', lean_weight: 0.1, vigor: 0.2, power: 0.2, speed: 30, attacks: [universe.attacks.peck], can_fly: true, playable: true, level: 0.003})
        .phylum({name: 'rabbit', symbol: '兎', lean_weight: 4, vigor: 2, speed: 15, attacks: [universe.attacks.bite], level: 0.06})
        .phylum({name: 'horse', symbol: '馬', lean_weight: 850, vigor: 29, speed: 13, attacks: [universe.attacks.kick], habitat: {grass: 5}, bias: -9, level: 3.77})
        .phylum({name: 'cow', symbol: '牛', lean_weight: 1000, vigor: 32, speed: 8, attacks: [universe.attacks.kick], habitat: {grass: 5}, bias: -9, level: 2.56})
        .phylum({name: 'fish', symbol: '魚', lean_weight: 2, vigor: 2, power: 0.2, attacks: [universe.attacks.bite], can_walk: false, can_swim: true, level: 0.02})
            .clazz({name: 'orca', symbol: '鯱', lean_weight: 10000, vigor: 100, power: 100, level: 50})
            .clazz({name: 'shark', symbol: '鮫', generic: true})
                .order({name: 'great white shark', lean_weight: 6400, vigor: 80, power: 80, level: 32})
                .order({name: 'megalodon', lean_weight: 90000, vigor: 300, power: 300, level: 450})
        .phylum({name: 'battleship', symbol: '艦', lean_weight: 20000000, vigor: 4472, power: 4472, attacks: [universe.attacks.burn], can_walk: false, can_swim: true, level: 67080, inventory: {width: 4, height: 9}, corpse: universe.products.iron})
        .phylum({name: 'fire being', symbol: '火', luminosity: 2, lean_weight: 100, speed: 15, attacks: [universe.attacks.burn], level: 2.25, corpse: universe.products.ash})
        .phylum({name: 'cloud being', symbol: '雲', lean_weight: 100, speed: 15, attacks: [universe.attacks.choke], level: 2.25, can_fly: true, corpse: universe.products.ash})
        .phylum({name: 'wind being', symbol: '風', lean_weight: 100, speed: 25, attacks: [universe.attacks.buffet], level: 2.25, can_fly: true, corpse: universe.products.ash})
        .phylum({name: 'elephant', symbol: '象', lean_weight: 10000, vigor: 100, power: 100, attacks: [universe.attacks.trample], level: 50})
        .phylum({name: 'car', symbol: '車', lean_weight: 3000, vigor: 55, power: 55, speed: 20, attacks: [universe.attacks.ram], level: 50})
        .phylum({name: 'crocodile', symbol: '鰐', lean_weight: 1500, vigor: 40, power: 80, speed: 10, attacks: [universe.attacks.bite], can_swim: true, level: 30})
        .phylum({name: 'brain', symbol: '脳', lean_weight: 3, vigor: 2, power: 1, speed: 15, attacks: [universe.attacks.zap], can_fly: true, level: 2, generic: true})
            .clazz({name: 'floating brain', vigor: 2, power: 1, speed: 15, level: 2})
            .clazz({name: 'psychic brain', vigor: 4, power: 1, speed: 15, level: 4})
            .clazz({name: 'superior brain', vigor: 4, power: 1, speed: 30, level: 8})
            .clazz({name: 'cosmic brain', vigor: 8, power: 1, speed: 30, level: 16})
        .phylum({name: 'thing', symbol: '物', lean_weight: 81, attacks: [universe.attacks.punch, universe.attacks.kick], inventory: {width: 1, height: 2}, generic: true, can_swim: true, bias: -6})
            .clazz({name: 'ugly thing', vigor: 9, power: 9, level: 1})
            .clazz({name: 'smelly thing', vigor: 14, power: 13, level: 2})
            .clazz({name: 'annoying thing', vigor: 18, power: 18, level: 4})
            .clazz({name: 'sad thing', vigor: 24, power: 25, level: 8})
            .clazz({name: 'unfriendly thing', vigor: 36, power: 36, level: 16})
            .clazz({name: 'boring thing', vigor: 51, power: 51, level: 32})
            .clazz({name: 'weird thing', vigor: 72, power: 72, level: 64})
            .clazz({name: 'ultimate thing', vigor: 102, power: 102, level: 128});

Square.prototype.attacks = [];  // for traps
Square
    .kingdom({name: 'ground', symbol: '土', continuous: true, walkable: true, flyable: true, generic: true})
        .phylum({name: 'grass', symbol: '草'})
        .phylum({name: 'woods', symbol: '林', opacity: 0.1})
        .phylum({name: 'forest', symbol: '森', continuous: false, opacity: 0.1})
        .phylum({name: 'downward staircase', symbol: '＞', can_descend: true, clumpiness: 0, bias: 1.5})
        .phylum({name: 'upward staircase', symbol: '＜', can_ascend: true, clumpiness: 0, bias: 1.5})
        .phylum({name: 'trap', symbol: '罠', bias: 1, clumpiness: 0, generic: true, continuous: false})
          .clazz({name: 'fire trap', generic: false, attacks: [universe.attacks.burn]})
          .clazz({name: 'lightning trap', generic: false, attacks: [universe.attacks.zap]})
    .kingdom({name: 'obstacle', symbol: '壁', continuous: false, flyable: true, generic: true, max_items: 0})
        .phylum({name: 'tree', symbol: '木', bias: -1, opacity: 0.4})
    .kingdom({name: 'liquid', symbol: '液', continuous: true, flyable: true, swimmable: true, generic: true})
        .phylum({name: 'water', symbol: '水', drinkable: true, bias: 1})
    .kingdom({name: 'town', symbol: '町', continuous: false, flyable: true, walkable: true, generic: true, tags: {town: 1}, clumpiness: 0})
        .phylum({name: 'grass2', symbol: '草'})
        .phylum({name: 'house', symbol: '家', bias: -0.5})
        .phylum({name: 'shop', symbol: '店', bias: -1})
        .phylum({name: 'temple', symbol: '寺', bias: -3, generic: true})
            .clazz({name: 'temple of light'})
            .clazz({name: 'temple of shadow'})
            .clazz({name: 'temple of nature'})
            .clazz({name: 'temple of fire'})
    .kingdom({name: 'void', symbol: '無', bias: -100, continuous: true})
        .phylum({name: 'inventory slot', max_items: 1, continuous: false});

universe.friends('woods', 'forest');
universe.friends('woods', 'tree');
universe.friends('forest', 'tree');
universe.friends('town', 'town');

universe.add_plane({light: 0.5, tags: {woods: 1, town: -1}});
universe.add_plane({tags: {grass: 1, town: -1}});
universe.add_plane({});
universe.add_plane({tags: {water: 0.25}});
for (var i = 4; i < 100; i++)
    universe.add_plane({});

title_screen = function() {
    $('#container')
        .append($('<button />').addClass('continue').text("new game").click(function(event) {
            BuildCharacter($('#container'), function(being) {
                universe.planes[0].place_randomly(being);
                new Controller({being: being, container: document.getElementById('container')});
                universe.simulate();
            });
        }))
        .append($('<div />').addClass('load').text('load game')
            .append($('<input />').attr('id', 'upload').attr('type', 'file').attr('id', 'uploader'))
        );
    FileReaderJS.setupInput($('#uploader')[0], {
        readAsDefault: 'Text',
        on: {
            load: function(event, file) {
                $('#container').empty();
                var player = universe.load_game(event.target.result);
                new Controller({being: player, container: document.getElementById('container')});
                universe.simulate();
            }
        }
    });
};

initialize = function() {
    title_screen();
};

