import PublitioAPI from '../node_modules/publitio_js_sdk/build/publitio-api.min.js'

const FORM = document.querySelector('#upload-form')
const FORM_TITLE = document.querySelector('#title')
const FORM_FILE = document.querySelector('#file')

const publitio = new PublitioAPI('<API key>', '<API secret>')

FORM.addEventListener("submit", (e) => submitForm(e))

function submitForm(event){
    event.preventDefault()
    
    const image = FORM_FILE.files[0]
    const title = FORM_TITLE.value

    publitio.uploadFile(image, 'file', {
        'public_id': title ?? null,
        'title': title ?? null
    })
        .then((data) => {
            if(!data.success){
                console.log("Something went wrong")
                return;
            }

            console.log("Successfully uploaded a file to Publitio via API")
        })
        .catch(() => {
            console.log("Something went wrong")
        })
}
