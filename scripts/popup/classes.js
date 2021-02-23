const search = new URLSearchParams(window.location.search)
const id = search.get('id')
const name = search.get('name')
loadClassesByTeacherId(id).then(data => {
    data.forEach(element => {
        $('#class-container').append('<div class="form-check" style="margin-top: 5px;">'
            + '<input class="form-check-input class" type="checkbox" value="' + element.id + '" data-name="' + element.name + '">'
            + '<label class="form-check-label" for="formCheck-1">' + element.name + '</label></div>')
    })

    $('#submit').click(() => {
        getAccounts().then(accounts =>{
            accounts.forEach(acc => {
                if(acc.name === name){
                    acc.classes = []
                    $('.class').each((i, el) => {
                        const ele = $(el)
                        console.log(el)
                        acc.classes.push({
                            name: ele.attr('data-name'),
                            id: ele.val()
                        })
                    })
                }
            })
            saveAccounts(accounts)
            window.location.replace('settings.html')
        })
    })
})