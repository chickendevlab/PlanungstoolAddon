const search = new URLSearchParams(window.location.search)
const id = search.get('id')
const uName = search.get('name')
const newCreated = search.has('newCreated')
loadClassesByTeacherId(id).then(data => {
    getClasses(uName).then(classes => {
        $('#class-container').empty()
        data.forEach(element => {
            $('#class-container').append('<div class="form-check" style="margin-top: 5px;">'
                + '<input class="form-check-input class" type="checkbox" value="' + element.id + '" data-name="' + element.name + '" '
                + (classes[element.name] ? 'checked' : '')
                + '><label class="form-check-label" for="formCheck-1">' + element.name + '</label></div>')
        })

    })

    $('#submit').click(() => {
        let classes = {}
        $('.class').each((i, el) => {
            const ele = $(el)
            if (ele.prop('checked')) {
                classes[ele.attr('data-name')] = ele.val()
            }
        })
        saveClasses(uName, classes).then(unused => {
            window.location.replace('settings.html?msg='
                + encodeURI(newCreated ? 'Der Lehreraccount für ' + name + ' wurde erfolgreich erstellt.' : 'Die Klassen von ' + name + ' wurden aktualisiert.'))
        })
    })
})