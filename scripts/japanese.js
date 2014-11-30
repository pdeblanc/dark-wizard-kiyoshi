japanese = {}

japanese.girl_names = ["Hana", "Ichika", "Himari", "Akari", "Kanna", "Sara", "Yui", "Niko", "Aoi", "Mei"]
japanese.boy_names = ["Haruto", "Riku", "Asahi", "Hinata", "Souta", "Reo", "Yūto", "Touma", "Minato"]
japanese.names = japanese.girl_names.concat(japanese.boy_names)

japanese.name = function(being) {
    return this.names[Math.floor(Math.random() * this.names.length)]
}
