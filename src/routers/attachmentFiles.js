const express = require('express');
const multer = require('multer');
const fileType = require('file-type');


const Attachment = require('../models/fileAttachment');

const router = new express.Router();

var fileUpload = multer({
    storage: multer.memoryStorage(),
    //fileFilter: (req, file, cb) =>{}
    onError: (err, next) => {
        console.log('multer error', err);
        next();
    }
}).single('file');

router.get('/attachments/:id', async (req, res) => {
    try {
        var file = await Attachment.findById(req.params.id);
        if (!file) {
            return res.status(404).send();
        }
        res.contentType(file.mimetype);
        //this is probably incorrect
        res.charset= file.encoding;
        res.send(file.buffer);
    }
    catch (err) {
        console.log("attachment GET error:", err);
        res.status(500).send();
    }
})

//JSON responses are designed for use with editorJS
router.post('/attachments/', (req, res, next) => {

    fileUpload(req, res, (err) => {
        if (err) {
            console.log("multer error:", err)
            return res.status(500).send(JSON.stringify({ success: 0 }));
        }
        else {
            next();
        }
    });

},
    async (req, res) => {
        try {
            if (req.file) {
                let file = req.file;
                // let fileInfo = await fileType.fromBuffer(req.file.buffer);
                // if (!fileInfo) {
                //     throw new Error("failed to get file information from upload buffer");
                // }
                var attachment = new Attachment({ size: file.size, buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype, encoding: file.encoding });
                let wResult = await attachment.save();
                
                //NOTE: be careful of req vs res 'file' obj keys; src code shows that 'file' obj props differ in plugin's index.js onUploadResponse(), and are required if file{} is provided
                return res.status(200).send({ success: 1, file: {url: '/attachments/' + wResult._id, name: wResult.originalname, size: wResult.size}});
            }
            else {
                return res.status(400).send();
            }
        }
        catch (err) {
            console.log("error saving attachment file to db", err);
            return res.status(500).send();
        }
    }
);



module.exports = router;