export const env = {
    // API key and secret got from https://publit.io/dashboard/api
    API_KEY: '<API key>',
    API_SECRET: '<API secret>',

    // Publitio folder made in advance for this project
    FOLDER: 'jsgallery',

    // Images displayed per page in gallery
    PER_PAGE: 5
}

// Important HTML dom objects which are manipulated through JS
export const dom = {
    FORM: document.querySelector('#upload-form'),
    FORM_FILE: document.querySelector('#file'),
    FORM_TITLE: document.querySelector('#title'),
    FORM_LOADER: document.querySelector('#upload-loader'),
    MESSAGE_CONTAINER: document.querySelector('#message-container'),
    GALLERY: document.querySelector("#gallery"),
    PAGINATION_PREV: document.querySelector('#pagination-prev'),
    PAGINATION_NEXT: document.querySelector('#pagination-next')
}