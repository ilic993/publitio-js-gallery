import PublitioAPI from '../node_modules/publitio_js_sdk/build/publitio-api.min.js'

const FORM = document.querySelector('#upload-form')

FORM.addEventListener("submit", (e) => submitForm(e))

function submitForm(event){
    event.preventDefault()
    console.log("Form submitted")
}
