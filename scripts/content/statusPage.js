if (window.location.href.startsWith('https://www.lernsax.de/wws/100001.php')) {
    const uName = $('body').attr('data-login')
    getAccounts().then(accounts => {
        let id
        let lastChange
        accounts.forEach(acc => {
            if (acc.name === uName) {
                id = acc.id
                lastChange = acc.lastChange ? acc.lastChange : 0
            }
        })

        if (id) {
            loadConferences(id).then(conf => {
                $('.table_lr.space tbody').append($('<tr><td class="title"><span id="title-field" style="cursor:pointer">Konferenzen</span>'
                    + '</td><td class="data" id="conference-control"></td></tr>'))


                $('#title-field').click(() => {
                    window.open('https://planungstool-fsg.de/id/' + id)
                })

                $('#conference-control').append('<div id="conferenz-addon" class="links"></div>')
                const inField = $('#conferenz-addon')
                conf.forEach(date => {
                    if (date.conferences.length != 0) {
                        let d = $('<li></li>')
                        d.append('<b>' + getDayNameByDate(getDateByGermanString(date.date)) + ', ' + date.date + '</b>')
                        date.conferences.forEach(conferencData => {
                            const conference = $('<details class="conferenz" style="outline: none;"></details>')
                            conference.append('<summary style="outline: none;"><b>' + conferencData.type + ': '
                                + (conferencData.type === 'SONSTIGES' ? '' : conferencData.fach) + '</b> ' + conferencData.zeit + '<br></summary>')
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
        } else {
            getIgnoredLSAccounts().then(accounts => {
                if (!accounts.includes(uName)) {
                    $('.table_lr.space tbody').append($('<tr id="confRow"><td class="title"><span id="title-field">Konferenzen</span></td>'
                        + '<td class="data" id="conference-control"></td></tr>'))
                    $('#conference-control').append('<span>Für diesen LernSax-Account wurde keine Klassen-ID von planungstool-fsg.de hinterlegt!'
                        + '</span><br><br><a href="#" class="control-link" id="ignore">Diesen Account ignorieren</a><br><span style="font-size: 0.75em;">'
                        + '<em>Du kannst immernoch über planungstool-fsg.de eine ID hinterlegen.</em></span>')
                    $('#ignore').click(e => {
                        e.preventDefault()
                        accounts.push(uName)
                        saveIgnoredLSAccounts(accounts)
                        $('#confRow').remove()
                    })
                }
            })

        }
    })
}

if (window.location.href.startsWith('https://planungstool-fsg.de/?id=')) {
    const params = new URLSearchParams(window.location.search)
    if (params.has('id')) {
        const id = params.get('id')
        getAccounts().then(accounts => {
            let ret = true
            accounts.forEach(acc => {
                if (acc.id === id) {
                    ret = false
                }
            })

            if (ret) {
                $('#body').prepend('<div id="content-addon" style="padding: 1em; margin: 0.5em; border: solid 1px DodgerBlue">'
                    + '<span style="display: block; margin-bottom: 0.5em;">Diese ID ist noch nicht mit einem LernSax-Account verknüpft. Hier kannst du dies tun:</span>'
                    + '<input id="input-id" type="text" placeholder="Dein LernSax-Email">'
                    + '<input id="input-submit" type="submit" class="knopf" value="ID hinterlegen"></div>')

                $('#input-submit').click(e => {
                    const data = $('#input-id').val()
                    let ret2 = true
                    accounts.forEach(acc => {
                        if (acc === data) {
                            ret2 = false
                        }
                    })
                    if (ret2) {
                        accounts.push({
                            name: data,
                            id: id
                        })
                        saveAccounts(accounts)
                        $('#content-addon').html('Dein LernSax-Name wurde hinterlegt.')
                        setTimeout(() => {
                            $('#content-addon').fadeOut(1000)
                        }, 3000)

                        getIgnoredLSAccounts().then(ignoredAcc => {
                            removeItemFromArray(ignoredAcc, data)
                            saveIgnoredLSAccounts(ignoredAcc)
                        })
                    }

                })
            }
        })
    }

}