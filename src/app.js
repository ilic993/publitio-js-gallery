// Importing our env and dom variables from constants.js
import { env, dom } from './constants'

// Importing PublitioAPI package
import PublitioAPI from '../node_modules/publitio_js_sdk/build/publitio-api.min.js'

// Creating a new PublitioAPI instance using our keys
const publitio = new PublitioAPI(env.API_KEY, env.API_SECRET)

// A boolean that will stop submitting our form before previous upload finishes
let uploading = false

// Current gallery page
let page = 1

// Number of skipped files in our Publitio list call
let offset = 0

// Total number of pages
let pages = 1

// Page load event
document.addEventListener('DOMContentLoaded', (e) => pageLoad())

// Form submit event
dom.FORM.addEventListener("submit", (e) => submitForm(e))

// Pagination click event
dom.PAGINATION_PREV.addEventListener("click", (e) => pageLoad(e,page - 1))
dom.PAGINATION_NEXT.addEventListener("click", (e) => pageLoad(e,page + 1))

// Triggered on page load
function pageLoad(event, goto = null){
    // Calculating page and offset
    page = goto ?? page
    offset = (page - 1) * env.PER_PAGE

    // Publitio files list API call
    publitio.call('/files/list', 'GET', {
        limit: env.PER_PAGE,
        folder: env.FOLDER,
        order: 'date:desc',
        filter_type: 'image',
        offset: offset
    })
        .then(response => {
            // In case of error
            if(!response.success){
                showMessage('error', 'Something went wrong with our gallery')
                return;
            }

            // Array of our Publitio images
            let images = response.files
            let galleryHtml = ''

            images.forEach(function(image){
                // For each file in response we will create a HTML structure and add it to the variable
                galleryHtml += `
                    <div class="gallery-image">
                        <span>${image.title}</span>
                        <img src="${image.url_preview}" alt="${image.title}" />
                    </div>`;
            })
            // Printing out in our gallery container dom
            dom.GALLERY.innerHTML = galleryHtml

            // Calculating the number of total pages
            pages = Math.ceil(response.files_total / env.PER_PAGE)
        })
        .catch(() => showMessage('error', 'Something went wrong with our gallery'))
        .finally(() => paginationCheck())
}

// Triggered when the form is submitted
function submitForm(event){
    event.preventDefault()
    if(uploading) return
    uploadLoading(true)

    // Storing the form values inside variables
    const image = dom.FORM_FILE.files[0]
    const title = dom.FORM_TITLE.value

    // Publitio upload a file API call
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

// Function sets uploading variable and shows/hides the loading graphic
function uploadLoading(value){
    if(value){
        dom.FORM_LOADER.classList.remove('hide')
        uploading = true
    } else {
        dom.FORM_LOADER.classList.add('hide')
        uploading = false
    }
}

// Function shows success or error messages in our message container dom
function showMessage(type, message){
    if(type == 'success')
        dom.MESSAGE_CONTAINER.innerHTML = `<div class="message success">${message}</div>`
    if(type == 'error')
        dom.MESSAGE_CONTAINER.innerHTML = `<div class="message error">${message}</div>`
}

// Function adds a new uploaded image to the top of the gallery
function prependNewImage(data){
    let temp = document.createElement('div')
    temp.innerHTML = `
    <div class="gallery-image">
        <span>${data.title}</span>
        <img src="${data.url_preview}" alt="${data.title}" />
    </div>`;
    
    dom.GALLERY.prepend(temp)

    // If there is more than max images in the gallery now, remove the last one
    let children = dom.GALLERY.children
    if(children.length > env.PER_PAGE){
        // In order to work with other PER_PAGE values change to children[children.length - 1]
        dom.GALLERY.removeChild(children[4]) 
    }
}

// Function check which pagination buttons should be visible
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
