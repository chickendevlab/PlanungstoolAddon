function getDayNameByString(dateStr) {
    var date = new Date(dateStr);
    return date.toLocaleDateString('de', { weekday: 'long' });
}

function getDayNameByDate(date) {
    return date.toLocaleDateString('de', { weekday: 'long' });
}

function getDateByGermanString(str) {
    var parts = str.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0])
}