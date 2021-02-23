let currentState = 'add'

let accounts

populateAccounts()
$('input[type=text]').change(() => {
    $('#invalid-id').hide()
    $('#invalid-name').hide()
})

$('#options').change(() => {
    let toChange
    if ($($("select#options option:selected").get(0)).hasClass('user')) {
        toChange = 'user'
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
            break
        case 'delete':
            $('#name-input').hide()
            $('#id-input').hide()
            $('#delete-input').show()
            $('#input-type').hide()
            break
        case 'user':
            $('#name-input').hide()
            $('#id-input').show()
            $('#delete-input').hide()
            $('#input-type').hide()

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
                            getIgnoredLSAccounts().then(ignoredAcc => {
                                removeItemFromArray(ignoredAcc, $('#name').val())
                                saveIgnoredLSAccounts(ignoredAcc)
                            })
                            populateAccounts()
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
                                type: 'teacher'
                            })
                            saveAccounts(accounts)
                            getIgnoredLSAccounts().then(ignoredAcc => {
                                removeItemFromArray(ignoredAcc, $('#name').val())
                                saveIgnoredLSAccounts(ignoredAcc)
                            })
                            window.location.replace('classes.html?id=' + isValid + '&name=' + $('#name').val())
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
            accounts = accounts.filter((element) => {
                return element.name !== id
            })
            saveAccounts(accounts)
            populateAccounts()
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