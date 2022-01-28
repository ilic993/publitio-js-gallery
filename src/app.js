import { env, dom } from './constants'
import PublitioAPI from '../node_modules/publitio_js_sdk/build/publitio-api.min.js'

const publitio = new PublitioAPI(env.API_KEY, env.API_SECRET)
let uploading = false

document.addEventListener('DOMContentLoaded', (e) => pageLoad())
dom.FORM.addEventListener("submit", (e) => submitForm(e))

function pageLoad(event){
    publitio.call('/files/list', 'GET', {
        limit: env.PER_PAGE,
        folder: env.FOLDER,
        order: 'date:desc',
        filter_type: 'image'
    })
        .then(response => {
            if(!response.success){
                showMessage('error', 'Something went wrong with our gallery')
                return;
            }

            let images = response.files
            let galleryHtml = ''

            images.forEach(function(image){
                galleryHtml += `
                    <div class="gallery-image">
                        <span>${image.title}</span>
                        <img src="${image.url_preview}" alt="${image.title}" />
                    </div>`;
            })
            dom.GALLERY.innerHTML = galleryHtml
        })
        .catch(() => showMessage('error', 'Something went wrong with our gallery'))
}

function submitForm(event){
    event.preventDefault()
    if(uploading) return
    uploadLoading(true)

    const image = dom.FORM_FILE.files[0]
    const title = dom.FORM_TITLE.value

    publitio.uploadFile(image, 'file', {
        'public_id': title ?? null,
        'title': title ?? null,
        'folder': env.FOLDER
    })
        .then((data) => {
            if(!data.success){
                showMessage('error', 'Something went wrong')
                return;
            }

            prependNewImage(data)
            showMessage('success', 'File uploaded successfully')
            dom.FORM.reset()
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

function prependNewImage(data){
    let temp = document.createElement('div')
    temp.innerHTML = `
    <div class="gallery-image">
        <span>${data.title}</span>
        <img src="${data.url_preview}" alt="${data.title}" />
    </div>`;
    
    dom.GALLERY.prepend(temp)

    let children = dom.GALLERY.children
    if(children.length > env.PER_PAGE){
        dom.GALLERY.removeChild(children[4])
    }
}