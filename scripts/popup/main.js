let currentState = 'add'

let accounts

const params = new URLSearchParams(window.location.search)
if (params.has('msg')) {
    showMessage(params.get('msg'))
}
populateAccounts()
$('input[type=text]').change(() => {
    $('#invalid-id').hide()
    $('#invalid-name').hide()
})

$('#options').change(() => {
    let toChange
    let user = false
    if ($($("select#options option:selected").get(0)).hasClass('user')) {
        toChange = 'user'
        user = $($("select#options option:selected").get(0)).val()
    } else {
        toChange = $($("select#options option:selected").get(0)).attr('id')
    }
    currentState = toChange
    switch (toChange) {
        case 'add':
            $('#name-input').show()
            $('#id-input').show()
            $('#delete-input').hide()
            $('#input-type').show()
            $('#class-select').hide()
            $('#account-type').hide()
            break
        case 'delete':
            $('#name-input').hide()
            $('#id-input').hide()
            $('#delete-input').show()
            $('#input-type').hide()
            $('#class-select').hide()
            $('#account-type').hide()
            break
        case 'user':
            getAccounts().then(accts => {
                console.log(accts)
                accts.forEach(acc => {
                    console.log(acc)
                    if (acc.name === user) {
                        if (acc.type === 'teacher') {
                            $('#account').text('Lehrer')
                            $('#class-select').show()
                            $('#class-select').attr('href', 'classes.html?id=' + acc.id + '&name=' + acc.name)
                        } else {
                            $('#account').text('Schüler')
                        }
                        $('#id').val(acc.id)
                    }
                })
                $('#name-input').hide()
                $('#id-input').show()
                $('#delete-input').hide()
                $('#input-type').hide()
                $('#account-type').show()
            })

    }
})

$('#save').click(() => {
    switch (currentState) {
        case 'add': {
            const name = $('#name').val()
            let b = true
            accounts.forEach(element => {
                if (element.name === name) {
                    $('#invalid-name').show()
                    b = false
                }
            })

            if (b) {
                const type = $('#type').val()
                console.log(type)
                if (type === 'student') {
                    validateId($('#id').val()).then((isValid) => {
                        if (isValid) {
                            accounts.push({
                                name: $('#name').val(),
                                id: isValid,
                                type: 'student'
                            })
                            saveAccounts(accounts)
                            populateAccounts()
                            showMessage('Der neue Account wurde erfolgreich angelegt.')
                        } else {
                            $('#invalid-id').show()
                        }
                    })
                } else {
                    validateTeacherId($('#id').val()).then(isValid => {
                        console.log('')
                        if (isValid) {
                            accounts.push({
                                name: $('#name').val(),
                                id: isValid,
                                type: 'teacher',
                                classes: []
                            })
                            saveAccounts(accounts)
                            window.location.replace('classes.html?newCreated=&id=' + isValid + '&name=' + $('#name').val())
                        } else {
                            $('#invalid-id').show()
                        }
                    })
                }
            }
            break
        }
        case 'delete': {
            const id = $('#delete-select').val()
            askForConfirm('Möchten Sie den Account ' + id + ' wirklich löschen?', () => {
                accounts = accounts.filter((element) => {
                    return element.name !== id
                })
                saveAccounts(accounts)
                populateAccounts()
                showMessage('Der Account ' + id + ' wurde erfolgreich gelöscht!')
            })
            break
        }

        case 'user': {
            validateId($('#id').val()).then(isValid => {
                if (isValid) {
                    const sel = $('#options').val()
                    accounts.forEach(element => {
                        if (element.name === sel) {
                            element.id = isValid
                        }
                    })
                    saveAccounts(accounts)
                    showMessage('Die ID des Accounts ' + sel + ' wurde erfolgreich zu "' + isValid + '" geändert.')
                } else {
                    $('#invalid-id').show()
                }
            })
        }

    }
})

function populateAccounts() {
    getAccounts().then(acc => {
        if (acc) {
            $('#users').empty()
            $('#delete-select').empty()
            for (i = 0; i < acc.length; i++) {
                $('#users').append('<option value="' + acc[i].name + '" class="user">' + acc[i].name + '</option>')
                $('#delete-select').append('<option value="' + acc[i].name + '" class="user">' + acc[i].name + '</option>')
                $('#options option[selected]').removeAttr('selected')
                $('#add').attr('selected', 'true')
            }

            accounts = acc
        } else {
            accounts = []
        }
    })


}

$('#close-msg').click(() => {
    $('#message').hide()
    $('#content').fadeIn(1000)
    $('body').height('100%')
})

function showMessage(msg, buttonMsg = 'Okay') {
    $('#overlay-content').text(msg)
    $('#close-msg').text(buttonMsg)
    $('body').height($('#content').height())
    $('#message').fadeIn(1000)
    $('#content').hide()
    $('#close-msg').show()
    $('#confirm').hide()
}

function askForConfirm(msg, yes = () => {}, no = () => {}) {
    $('#overlay-content').text(msg)
    $('body').height($('#content').height())
    $('#message').fadeIn(1000)
    $('#content').hide()
    $('#close-msg').hide()
    $('#confirm').show()
    $('#yes').click(() => {
        $('#yes').off('click')
        $('#message').hide()
        $('#content').fadeIn(1000)
        $('body').height('100%')
        yes()
    })
    $('#no').click(() => {
        $('#no').off('click')
        $('#message').hide()
        $('#content').fadeIn(1000)
        $('body').height('100%')
        no()
    })
}