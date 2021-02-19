if (window.location.href.startsWith('https://www.lernsax.de/wws/100001.php')) {
    const uName = $('.top_user_name').first().text()
    getAccounts().then(accounts => {
        let id
        accounts.forEach(acc => {
            if (acc.name === uName) {
                id = acc.id
            }
        })

        if (id) {
            loadConferences(id).then(conf => {
                $('.table_lr.space tbody').append($('<tr><td class="title"><span id="title-field" style="cursor:pointer">Konferenzen</span></td><td class="data"><ul id="conferenz-addon" class="links"></ul></td></tr>'))
                const inField = $('#conferenz-addon')

                $('#title-field').click(() => {
                    window.open('https://planungstool-fsg.de/id/' + id)
                })

                console.log(conf)
                conf.forEach(date => {
                    if (date.conferences.length != 0) {
                        let d = $('<li></li>')
                        d.append('<b>' + date.date + '</b> (' + date.conferences.length + ')')
                        date.conferences.forEach(conferencData =>{
                            const conference = $('<li class="conferenz" style="margin-bottom: 10px"></li>')
                            conference.append('<b>' + conferencData.type + ':</b> ' + conferencData.zeit + '<br>')
                            conference.append('<span>' + conferencData.fach + '</span><br>')
                            if(conferencData.href){
                                conference.append('<a href="' + conferencData.href + '" target="_blank">' + conferencData.location + '</a>')
                            } else if (conferencData.location){
                                conference.append(conferencData.location + '<br>')
                            }
                            if(conferencData.notice){
                                conference.append('<i>' + conferencData.notice)
                            }

                            d.append(conference)
                        })
                        inField.append(d)
                    }
                })
            })
        } else {
            // handle no account
        }
    })
}

