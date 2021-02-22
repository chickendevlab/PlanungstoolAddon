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

function removeItemFromArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            arr.splice(i, 1)
        }
    }
    return arr
}