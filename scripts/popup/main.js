let currentState = 'add'

let accounts

// Um Benachrichtigungen anzeigen zu lassen, einfach settings.html mit ?msg=<Nachricht hier> öffnen
const params = new URLSearchParams(window.location.search)
if (params.has('msg')) {
    showMessage(params.get('msg'))
}
// Lade alle Accounts
populateAccounts()

// Verstecke Fehlermeldung bei Inhaltsänderung
$('input[type=text]').change(() => {
    $('#invalid-id').hide()
    $('#invalid-name').hide()
})

// Listener, welcher den Input für Namen versteckt/zeigt, je nachdem, ob man "Lehrer" oder "Schüler" auswählt
$('#type').change(() => {
    if ($('#type').val() === 'teacher') {
        $('#name-input').show()
    } else {
        $('#name-input').hide()
    }
})
// Ändere Menü-Items beim Ändern der Optionen
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
    // Zeige benötigte und verstecke unnötige Elemente
    switch (toChange) {
        case 'add':
            $('#name-input').show()
            
            // Zeige Email-Input, wenn "Lehrer" ausgewählt ist
            if ($('#type').val() === 'teacher') {
                $('#name-input').show()
            } else {
                $('#name-input').hide()
            }
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
                    // Zeige an, ob der Account ein Schüler oder ein Lehreraccount ist
                    if (acc.name === user) {
                        if (acc.type === 'teacher') {
                            // Aktiviere ID-Input für Schüler
                            $('#id').removeAttr('disabled')
                            // Aktiviere Save-Button für Schüler
                            $('#save').removeAttr('disabled')
                            $('#account').text('Lehrer')
                            $('#class-select').show()
                            $('#class-select').click((e) => {
                                e.preventDefault()
                                loadClassesWithTeacherId(acc.id)
                                showMessage('Die Klassen-IDs wurden aktualisiert!')
                                $('#class-select').off('click')
                            })
                        } else {
                            // Deaktiviere ID-Input für Schüler
                            $('#id').attr('disabled', 'true')
                            // Deaktiviere Save-Button für Schüler
                            $('#save').attr('disabled', 'disabled')

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
            // Überprüfe, dass der eingegebene Account-Name nicht bereits in Verwendung ist
            // Dies hat keinen Einfluss auf Schüleraccounts, da diese nicht mit der LernSax-Email, sondern mit dem Klassennamen verknüpft sind
            accounts.forEach(element => {
                if (element.name === name) {
                    $('#invalid-name').show()
                    b = false
                }
            })
            if (b) {
                // Lehrer oder Schüler?
                const type = $('#type').val()
                if (type === 'student') {
                    // Überprüfe Klassen-ID und lade Informationen
                    validateId($('#id').val()).then((data) => {
                        console.log(data)
                        if (data.valid) {
                            // Entferne alle Accounts für die bestimmte Klasse
                            accounts = accounts.filter(el => {
                                return el.name !== data.name
                            })
                            // Füge die ID als Account hinzu
                            accounts.push({
                                name: data.name,
                                id: data.id,
                                type: 'student'
                            })

                            saveAccounts(accounts)
                            populateAccounts()
                            showMessage('Die neue ID wurde erfolgreich angelegt.')
                        } else {
                            $('#invalid-id').show()
                        }
                    })
                } else {
                    // Überprüfe Lehrerkennung
                    validateTeacherId($('#id').val()).then(isValid => {
                        if (isValid) {
                            // Füge Lehrerkennung zu Accounts hinzu
                            accounts.push({
                                name: $('#name').val(),
                                id: isValid,
                                type: 'teacher'
                            })

                            // Lade Klassen-IDs in den Cache
                            loadClassesWithTeacherId(isValid)
                            // Speichere Accounts
                            saveAccounts(accounts)
                            showMessage('Der neue Account wurde erfolgreich angelegt.')
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
                //Entferne Account
                accounts = accounts.filter((element) => {
                    return element.name !== id
                })

                //Speichere Accounts ohne dem gelöschten Account
                saveAccounts(accounts)

                // Kopiere Accounts (Objekt zu JSON; JSON zu neuem Objekt)
                let copy = JSON.parse(JSON.stringify(accounts))

                // Entferne alle Schüleraccounts
                copy = copy.filter((element) => {
                    return element.type === 'teacher'
                })

                // Wenn kein Lehreraccount mehr verfügbar
                if (copy.length == 0) {
                    // ...lösche Klassen
                    deleteClasses()
                }

                //Aktualisiere Accounts
                populateAccounts()
                showMessage('Der Account ' + id + ' wurde erfolgreich gelöscht!')
            })
            break
        }

        // Behandelt das Aktualisieren der Accountinformationen
        // Nur für Lehreraccounts möglich, wenn sich eine Klassen-ID ändert, muss man die Klasse einfach nochmal löschen und dann neu hinzufügen
        case 'user': {
            // Überprüfe neue ID
            validateTeacherId($('#id').val()).then(isValid => {
                if (isValid) {
                    const sel = $('#options').val()
                    // Update Accountinfos
                    accounts.forEach(element => {
                        if (element.name === sel) {
                            element.id = isValid
                        }
                    })
                    loadClassesWithTeacherId(isValid)
                    saveAccounts(accounts)
                    showMessage('Die ID des Accounts ' + sel + ' wurde erfolgreich zu "' + isValid + '" geändert.')
                } else {
                    $('#invalid-id').show()
                }
            })



        }

    }
})


// Funktion zum Anzeigen aller Accounts
function populateAccounts() {
    getAccounts().then(acc => {
        if (acc) {

            // Leere alle DropDown-Menüs
            $('#users').empty()
            $('#delete-select').empty()

            // Iteriere über Accounts
            for (i = 0; i < acc.length; i++) {
                // Füge alle Accounts zu den Optionen hinzu
                $('#users').append('<option value="' + acc[i].name + '" class="user">' + acc[i].name + '</option>')

                // Füge alle Accounts zum Delete-DropDown hinzu
                $('#delete-select').append('<option value="' + acc[i].name + '" class="user">' + acc[i].name + '</option>')

                // Wähle "Hinzufügen" aus
                $('#options option[selected]').removeAttr('selected')
                $('#add').attr('selected', 'true')
            }

            accounts = acc
        } else {
            accounts = []
        }
    })


}

// Listener für den Close-Button des Modals
$('#close-msg').click(() => {
    $('#message').hide()
    $('#content').fadeIn(1000)
    $('body').height('100%')
})

// Funktion für ein costum-alert()
function showMessage(msg, buttonMsg = 'Okay') {
    $('#overlay-content').text(msg)
    $('#close-msg').text(buttonMsg)
    $('body').height($('#content').height())
    $('#message').fadeIn(1000)
    $('#content').hide()
    $('#close-msg').show()
    $('#confirm').hide()
}

// Funktion für ein costum-confirm()
function askForConfirm(msg, yes = () => { }, no = () => { }) {
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