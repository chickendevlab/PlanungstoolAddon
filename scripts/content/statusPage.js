function removeItemFromArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            arr.splice(i, 1)
        }
    }
    return arr
}

if (window.location.href.startsWith('https://www.lernsax.de/wws/100001.php')) {
    const uName = $('body').attr('data-login')
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
// Lehrer-Features -> nächstes Update
/* else {
    const title = $('h1#heading').text().split(' ')
    removeItemFromArray(title, '-').pop()
    if (title.includes('Fachlehrerteam')) {
        removeItemFromArray(title, 'Fachlehrerteam')
        if (title.length == 1 || (title.length == 2 && title[1] === 'dt') || (title.length == 2 && title[1] === 'ts')) {
            if (title.length == 2) {
                switch (title[1]) {
                    case 'dt':
                        title[0] = title[0] + 'd'
                        break
                    case 'ts':
                        title[0] = title[0] + 's'
                        break
                }

                title.pop()
            }
            const uName = $('body').attr('data-login')
            getAccounts().then(accounts => {
                let id
                let classes
                accounts.forEach(acc => {
                    if (acc.name === uName && acc.type === 'teacher') {
                        id = acc.id
                        classes = acc.classes
                    }
                })

                if (classes.length) {
                    let id
                    classes.forEach(clazz => {
                        if (clazz.name === title[0]) {
                            id = clazz.id
                        }
                    })

                    if (id) {
                        populateConferences(id)
                    }
                }
            })
        }
    } else {
        const titleStr = title.join(' ')
    }
}
*/


function populateConferences(id) {
    loadConferences(id).then(conf => {
        $('.table_lr.space tbody').append($('<tr><td class="title"><span id="title-field" style="cursor:pointer">Konferenzen</span>'
            + '</td><td class="data" id="conference-control"></td></tr>'))


        $('#title-field').click(() => {
            window.open('https://planungstool-fsg.de/id/' + id)
        })

        $('#conference-control').append('<div id="conferenz-addon" class="links"></div>')
        const inField = $('#conferenz-addon')
        if(conf.length == 0 ){
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
                        +( conferencData.inprogress ? '<span style="color: white; font-size: 13px; background-color: #FF5500; padding: 1px 2px; margin:5px 0px 5px 1px;"> JETZT </span>' : ' </summary>'))
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