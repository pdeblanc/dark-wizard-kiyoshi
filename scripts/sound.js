Sound = {};

Sound.play = function(class_name, volume) {
    if (volume === undefined)
        volume = 1;
    audios = $("." + class_name + "-audio").toArray().filter(function(audio) { return (!audio.duration || audio.paused) && audio.readyState; });
    if (audios.length) {
        audio = audios[Math.floor(Math.random() * audios.length)];
        audio.currentTime = 0;
        audio.volume = volume;
        audio.cloneNode().play();
    }
};
