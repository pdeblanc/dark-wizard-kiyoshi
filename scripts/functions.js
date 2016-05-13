function argmax(score, items) {
    var result = items[0];
    var result_score = score(items[0]);
    for (var i = 1; i < items.length; i++) {
        var item_score = score(items[i]);
        if (item_score > result_score) {
            result = items[i];
            result_score = item_score;
        }
    }
    return result;
}
