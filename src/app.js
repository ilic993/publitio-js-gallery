import { env, dom } from './constants'
import PublitioAPI from '../node_modules/publitio_js_sdk/build/publitio-api.min.js'

const publitio = new PublitioAPI(env.API_KEY, env.API_SECRET)
let uploading = false

dom.FORM.addEventListener("submit", (e) => submitForm(e))

function submitForm(event){
    event.preventDefault()
    if(uploading) return
    uploadLoading(true)

    const image = dom.FORM_FILE.files[0]
    const title = dom.FORM_TITLE.value

    publitio.uploadFile(image, 'file', {
        'public_id': title ?? null,
        'title': title ?? null
    })
        .then((data) => {
            if(!data.success){
                showMessage('error', 'Something went wrong')
                return;
            }

            showMessage('success', 'File uploaded successfully')
        })
        .catch(() => showMessage('error', 'Something went wrong'))
        .finally(() => uploadLoading(false))
}

function uploadLoading(value){
    if(value){
        dom.FORM_LOADER.classList.remove('hide')
        uploading = true
    } else {
        dom.FORM_LOADER.classList.add('hide')
        uploading = false
    }
}

function showMessage(type, message){
    if(type == 'success')
        dom.MESSAGE_CONTAINER.innerHTML = `<div class="message success">${message}</div>`
    if(type == 'error')
        dom.MESSAGE_CONTAINER.innerHTML = `<div class="message error">${message}</div>`
}