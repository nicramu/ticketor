const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
const path = require('path');
const os = require('os');
const fs = require('fs');
const pdf2html = require('pdf2html')
// Import Admin SDK
const { getDatabase } = require('firebase-admin/database');
const tesseract = require("node-tesseract-ocr")





// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//



exports.getfile = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const fileName = object.name;
    const userid = object.name.split('/')[0]
    const fileid = object.name.split('/')[1]
    const contentType = object.contentType
    const tmppath = path.join(os.tmpdir(), encodeURIComponent(fileName))

    functions.logger.log('pocessing file: ' + fileName + ' of type: ' + contentType);

    /*             getDatabase().ref('users/' + userid + '/files/' + fileid).get().then((snapshot) => {
                    functions.logger.log(snapshot.val().url)
                }) */

    /*             if(){
                return null
            } */

    let url = await admin.storage().bucket(fileBucket).file(fileName).getMetadata()

    //if its not a pdf, jpg, png then stop
    if (contentType == 'application/pdf') {
        //download file to tmp to process further
        await admin.storage().bucket(fileBucket).file(fileName).download({ destination: tmppath });
        let txt = await readpdf(); //extract text
        //ocr
        let databaseobj = await getDatabase().ref('users/' + userid + '/files/' + fileid).get().then((snapshot) => {
            return snapshot.val()
        })
        let ocr = {}
        if (!txt) { return }
        /*            result = await regex(/poci.g|pkp/gmi, txt, 0)
                   if (result == true) {
                       databaseobj.category = 'train'
                       ocr={"destination":await regex(/^(\d{2}:\d{2})(\D+)(\d{2}:\d{2})\D+$/gmi, txt, 1),"carrier":await regex(/^Pociąg\D+\d+/gmi, txt, 1)}
                       console.log()
                   }
                   result = await regex(/odlot./gmi, txt, 0)
                   if (result == true) {
                       databaseobj.category = 'airplane'
                   } */

        switch (await regex(/poci.g|pkp/gmi, txt, 0)) {
            case true:
                databaseobj.category = 'train'
                let destination = await regex(/^(\d{2}:\d{2})(\D+)(\d{2}:\d{2})\D+$/gmi, txt, 1)
                let carrier = await regex(/^Pociąg\D+\d+/gmi, txt, 1)
                ocr = { "destination": destination, "carrier": carrier }
                if (!destination && !carrier) {
                    let destination = await regex(/(?!\S)\D+\d{2}:\d{2} - \d{2}:\d{2}/gmi, txt, 1)
                    let carrier = await regex(/^\d{4}/gmi, txt, 1)
                    ocr = { "destination": destination, "carrier": carrier }
                }
                break;
            case false:
                switch (await regex(/odlot./gmi, txt, 0)) {
                    case true:
                        databaseobj.category = 'airplane'
                        functions.logger.log(txt)
                        let destination = await regex(/\w+\s-\s\w+/gmi, txt, 1)
                        let carrier = await regex(/(?<=Wylot\n\n)\d{2}:\d{2}/gmi, txt, 1)
                        ocr = { "destination": destination, "carrier": carrier }
                        break
                }
        }



        async function regex(expression, string, type) {
            let regex = new RegExp(expression)
            if (type) {
                let res = regex.exec(string)
                if (!res) { return null } else {
                    return res[0].trim()
                }
            } else {
                return regex.test(string)
            }
        }
        //
        //update database
        getDatabase().ref('users/' + userid + '/files/' + fileid).update({
            text: txt,
            url: url[0].mediaLink,
            category: databaseobj.category,
            ocr: ocr
        });

        return [fs.unlinkSync(tmppath), functions.logger.log('proceed pdf: ' + txt)] //delete tmp
    } else if (contentType == 'image/jpeg' || contentType == 'image/png') {


        await admin.storage().bucket(fileBucket).file(fileName).download({ destination: tmppath });
        let txt = await tesseractocr(); //extract text
        console.log(txt)
        //ocr
        let databaseobj = await getDatabase().ref('users/' + userid + '/files/' + fileid).get().then((snapshot) => {
            return snapshot.val()
        })
        let ocr = {}
        if (!txt) { return }


        switch (await regex(/poci.g|pkp/gmi, txt, 0)) {
            case true:
                databaseobj.category = 'train'
                let destination = await regex(/^(\d{2}:\d{2})(\D+)(\d{2}:\d{2})\D+$/gmi, txt, 1)
                let carrier = await regex(/^Pociąg\D+\d+/gmi, txt, 1)
                ocr = { "destination": destination, "carrier": carrier }
                if (!destination && !carrier) {
                    let destination = await regex(/(?!\S)\D+\d{2}:\d{2} - \d{2}:\d{2}/gmi, txt, 1)
                    let carrier = await regex(/^\d{4}/gmi, txt, 1)
                    ocr = { "destination": destination, "carrier": carrier }
                }
                break;
            case false:
                switch (await regex(/odlot./gmi, txt, 0)) {
                    case true:
                        databaseobj.category = 'airplane'
                        functions.logger.log(txt)
                        let destination = await regex(/\w+\s-\s\w+/gmi, txt, 1)
                        let carrier = await regex(/(?<=Wylot\n\n)\d{2}:\d{2}/gmi, txt, 1)
                        ocr = { "destination": destination, "carrier": carrier }
                        break
                }
        }



        async function regex(expression, string, type) {
            let regex = new RegExp(expression)
            if (type) {
                let res = regex.exec(string)
                if (!res) { return null } else {
                    return res[0].trim()
                }
            } else {
                return regex.test(string)
            }
        }


        async function tesseractocr() {
            let userlang = await getDatabase().ref('users/' + userid + '/language/tesseract').get().then((snapshot) => {
                return snapshot.val()
            })
            const config = {
                lang: userlang,
                oem: 1,
                psm: 3,
            }
            try {
                const text = await tesseract.recognize(tmppath, config)
                return text
            } catch (error) {
                console.log(error.message)
            }
        }

        getDatabase().ref('users/' + userid + '/files/' + fileid).update({
            text: txt,
            url: url[0].mediaLink,
            category: databaseobj.category,
            ocr: ocr
        });
        return [fs.unlinkSync(tmppath), functions.logger.log('proceed img: ' + txt)] //delete tmp
    } else {
        return functions.logger.log('content type not to be processed');
    }


    async function readpdf() {
        return new Promise((resolve) => {
            pdf2html.text(tmppath, (err, text) => {
                if (err) {
                    console.error('Conversion error: ' + err)
                } else {
                    resolve(text)
                }
            })
        })
    };


});



exports.sendByeEmail = functions.auth.user().onDelete((user) => {
    admin.database().ref('users/' + user.uid).set(null, (error) => {
        if (error) {
            // The write failed...
        } else {
            // Data saved successfully!
        }
    });


    // Delete the file
    admin.storage().bucket().deleteFiles(user.uid).then(() => {
        // File deleted successfully
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });

})