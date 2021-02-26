function loadConferences(id) {
    return new Promise((resolve, reject) => {
        fetch('https://www.planungstool-fsg.de?id=' + id).then(r => r.text()).then(t => {
            const dom = $(t)
            $('.itemkonferenz', dom).each((i, e) => {
                $(e).addClass('item')
            })
            $('.itemarbeit', dom).each((i, e) => {
                $(e).addClass('item')
            })

            let days = []
            $('.day', dom).each((index1, element1) => {
                const $element1 = $(element1)
                if ($('.item', $element1).length != 0) {
                    days[index1] = {
                        date: index1 == 0 ? 'Heute' : $('h3', $element1).text().substr($('h3', $element1).text().length - 10),
                        conferences: []
                    }

                    $('.item', $element1).each((index2, element2) => {
                        const $element2 = $(element2)
                        const conference = {
                            id: new Date($('details summary span#timestamp', $element2).text()).valueOf(),
                            type: $('b', $element2).first().text(),
                            fach: $('#fach', $element2).text(),
                            zeit: $('span#zeit', $element2).text(),
                            inprogress: $('.inprogress', $element2).length == 1

                        }
                        conference.href = data

                        const hinweis = $('#hinweis', $element2)
                        if (hinweis.children().length == 1) {
                            if (hinweis.contents().first().prop('tagName') === 'A') {
                                if (hinweis.contents().first().attr('href').includes('bbb.schullogin.de')) {
                                    conference.href = hinweis.contents().first().attr('href')

                                    conference.location = 'Auf Schullogin.de'
                                } else {
                                    conference.href = hinweis.contents().first().attr('href')
                                    conference.location = 'Externe Plattform'
                                }
                            }

                            hinweis.contents().each((index, e) => {
                                $e = $(e)
                                if ($e.prop('tagName') === 'A') {
                                    const data = $e.attr('href')
                                    if (data.includes('bbb.schullogin.de')) {
                                        conference.href = data
                                        conference.location = 'Auf Schullogin.de'
                                    }
                                }
                            })
                        } else if (hinweis.text().toLowerCase() === 'lernsax') {
                            conference.location = 'Auf Lernsax'
                        } else {
                            conference.notice = hinweis.text()
                        }
                        days[index1].conferences.push(conference)

                    })
                }
            })
            resolve(days)
        }).catch(err => {
            reject(err)
        })
    })
}

function validateId(input) {
    return new Promise((resolve, reject) => {
        let out
        if (input.length == 4) {
            out = input
        } else if (input.includes('planungstool-fsg.de')) {
            try {
                const url = new URL(input)
                const arr = url.pathname.split('/')
                if (arr[arr.length - 1] === '') {
                    arr.pop()
                }

                if (arr[arr.length - 1].length == 4) {
                    out = arr[arr.length - 1]
                } else {
                    resolve(false)
                    return
                }
            } catch (e) {
                resolve(false)
                return
            }
        } else {
            resolve(false)
            return
        }
        fetch('https://www.planungstool-fsg.de?id=' + out).then(r => r.text()).then(t => {
            resolve((t.includes('nomatch') ? false : out))
        }).catch(err => {
            resolve(false)
        })
    })
}


function getAccounts() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get(['accounts']).then((data) => {
            if (data.accounts) {
                resolve(data.accounts)
            } else {
                resolve([])
            }
        })
    })
}

function validateTeacherId(input) {
    return new Promise((resolve, reject) => {
        fetch('https://planungstool-fsg.de/klassen_id.php?lehrer_id=' + input).then(r => r.text()).then(t => {
            resolve((t.includes('nomatch') ? false : input))
        }).catch(err => {
            resolve(false)
        })
    })
}

function saveAccounts(accounts) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({
            accounts: accounts
        }, (data) => {
            resolve(true)
        })
    })
}

function loadClassesByTeacherId(id) {
    return new Promise((resolve, reject) => {
        fetch('https://planungstool-fsg.de/klassen_id.php?lehrer_id=' + id).then(r => r.text()).then(t => {
            const dom = $('<html><body>' + t + '</body></html>')
            let ret = []
            $('span', dom).each((index, element) => {
                ret.push({
                    id: $(element).attr('data-id'),
                    name: $(element).text()
                })
            })

            resolve(ret)
        }).catch(err => {
            reject(err)
        })
    })
}