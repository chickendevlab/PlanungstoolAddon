// Startseite für Schüler
if (window.location.href.startsWith('https://www.lernsax.de/wws/100001.php')) {
    // Wird den Accountnamen (Klassennahmen)
    let uName

    $('.top_option').each((i, e) => {
        const txt = $(e).text()
        if (txt.includes('Klassenzimmer')) {
            uName = e.split(' ')[0]
        }

    })

    getAccounts().then(accounts => {
        let id
        let teacher = false
        let lastChange
        accounts.forEach(acc => {
            if (acc.name === uName) {
                id = acc.id
                lastChange = acc.lastChange ? acc.lastChange : 0
                if (acc.type === 'teacher') {
                    teacher = true
                }
            }
        })

        if (id && !teacher) {
            populateConferences(id)
        } else if (!teacher) {

            if (!accounts.includes(uName)) {
                $('.table_lr.space tbody').append($('<tr id="confRow"><td class="title"><span id="title-field">Konferenzen</span></td>'
                    + '<td class="data" id="conference-control"></td></tr>'))
                $('#conference-control').append('<span>Für diesen LernSax-Account wurde keine Klassen-ID von planungstool-fsg.de hinterlegt!</span>')
            }

        }
    })
}
else if (window.location.href.startsWith('https://www.lernsax.de/wws/100009.php')) {
    const title = $('h1#heading').text().split(' ')
    const uName = $('body').attr('data-login')
    getAccounts().then(accounts => {
        let id
        accounts.forEach(acc => {
            if (acc.name === uName) {
                id = acc.id
            }
        })

        getClasses().then(classes => {

            if (title[title.length - 1] === 'Übersicht') {
                title.pop()
                title.pop()
                if (title[title.length - 1] === 'Fachlehrerteam') {
                    title.pop()
                    let clazz = title[0]
                    if (title.length == 2) {
                        if (title[0] === '10/3') {
                            clazz = clazz + 'd+t'
                        } else {
                            clazz = clazz + (title[1] === 'dt' ? 'd' : 't')
                        }
                    }
                    if (classes[clazz]) { populateConferences(classes[clazz]) } else {
                        $('.table_lr.space tbody').append($('<tr><td class="title"><span id="title-field" style="cursor:pointer">Konferenzen</span>'
                            + '</td><td class="data" id="conference-control">'
                            + '<div id="conferenz-addon" class="links"><ul>'
                            + '<li>Für dieses Fachlehrerteam ist keine Klasse zugeordnet! Dies kann entweder daran liegen, dass <ul><li>die lokalen Klassen-IDs nicht mehr ganz aktuell sind<br>'
                            + 'Öfffnen Sie das Popup-Fenster des Addons, unter Accounts können Sie die Klassen-IDs aktualisieren</li>'
                            + '<li>dass diese Klasse eine BiNa-Klasse ist<br>Bei BiNa-Klassen werden die Konferenzen nur bei dem Deutschen bzw. Tschechischen Teams angezeigt.</li>'
                            + '<li>oder dass dieses Team keiner Planungstool-ID zugeordnet werden konnte. Dies kann daran liegen, dass für dieses Team keine Klasse bei planungstool-fsg.de existiert.</ul></li></ul>'
                            + '</div></td></tr>'))

                    }
                }

            }
        })
    })

}



function populateConferences(id) {
    loadConferences(id).then(conf => {
        $('.table_lr.space tbody').append($('<tr><td class="title"><span id="title-field" style="cursor:pointer">Konferenzen</span>'
            + '</td><td class="data" id="conference-control"></td></tr>'))


        $('#title-field').click(() => {
            window.open('https://planungstool-fsg.de/id/' + id)
        })

        $('#conference-control').append('<div id="conferenz-addon" class="links"></div>')
        const inField = $('#conferenz-addon')
        if (conf.length == 0) {
            inField.append($('<li>Alles ruhig... Für dich sind keine Termine vorhanden!</li>'))
        }
        conf.forEach(date => {
            if (date.conferences.length != 0) {
                let d = $('<li></li>')
                d.append('<b>' + (date.date === 'Heute' ? ('Heute, ' + new Date().toLocaleDateString('de')) : (getDayNameByDate(getDateByGermanString(date.date)) + ', ' + date.date)) + '</b>')
                date.conferences.forEach(conferencData => {
                    const conference = $('<details class="conferenz" style="outline: none;"></details>')
                    conference.append('<summary style="outline: none;"><b>' + conferencData.type + ': '
                        + (conferencData.type === 'SONSTIGES' ? '' : conferencData.fach) + '</b> ' + conferencData.zeit + ' '
                        + (conferencData.inprogress ? '<span style="color: white; font-size: 13px; background-color: #FF5500; padding: 1px 2px; margin:5px 0px 5px 1px;"> JETZT </span>' : ' </summary>'))
                    const conferenceContent = $('<div style="padding-left: 2em; margin-bottom: 10px;"></div>')
                    if (conferencData.type === 'SONSTIGES') { conferenceContent.append('<span>' + conferencData.fach + '</span><br>') }
                    if (conferencData.href) {
                        conferenceContent.append('<a href="' + conferencData.href + '" target="_blank">' + conferencData.location + '</a>')
                    } else if (conferencData.location) {
                        conferenceContent.append(conferencData.location + '<br>')
                    }
                    if (conferencData.notice) {
                        conferenceContent.append('<i>' + conferencData.notice)
                    }
                    conference.append(conferenceContent)
                    d.append(conference)
                })
                inField.append(d)
            }
        })
    })
}