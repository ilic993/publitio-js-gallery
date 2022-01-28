import { env, dom } from './constants'
import PublitioAPI from '../node_modules/publitio_js_sdk/build/publitio-api.min.js'

const publitio = new PublitioAPI(env.API_KEY, env.API_SECRET)
let uploading = false
let page = 1
let offset = 0
let pages = 1

document.addEventListener('DOMContentLoaded', (e) => pageLoad())
dom.FORM.addEventListener("submit", (e) => submitForm(e))
dom.PAGINATION_PREV.addEventListener("click", (e) => pageLoad(e,page - 1))
dom.PAGINATION_NEXT.addEventListener("click", (e) => pageLoad(e,page + 1))

function pageLoad(event, goto = null){
    page = goto ?? page
    offset = (page - 1) * env.PER_PAGE

    publitio.call('/files/list', 'GET', {
        limit: env.PER_PAGE,
        folder: env.FOLDER,
        order: 'date:desc',
        filter_type: 'image',
        offset: offset
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
            pages = Math.ceil(response.files_total / env.PER_PAGE)
        })
        .catch(() => showMessage('error', 'Something went wrong with our gallery'))
        .finally(() => paginationCheck())
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

function paginationCheck(){
    if(page == 1) {
        dom.PAGINATION_PREV.classList.add('hide')
    } else {
        dom.PAGINATION_PREV.classList.remove('hide')
    }

    if(page == pages){
        dom.PAGINATION_NEXT.classList.add('hide')
    } else {
        dom.PAGINATION_NEXT.classList.remove('hide')
    }
}
