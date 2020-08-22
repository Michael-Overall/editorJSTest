const express = require('express');
const hbs = require('hbs');
const path = require('path');
const multer = require('multer');

const Image = require('../models/image');


//TODO: cap file size if implementing in production environment
var upload = multer(
    {
        //dest: "../uploads/",
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (process.env.VALID_FILE_MIMETYPES.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(null, false);
                return callback(new Error(file.mimetype + " is an invalid file upload type"));
            }
        },
        onError: (err, next) => {
            console.log('error', err);
            next();
        }
    }
).single('image');

const router = new express.Router();
router.get('/images/:id', async (req, res) => {
    try {
        let id = req.params.id;
        var foundImg = await Image.findById(id);
        if (foundImg) {
            res.contentType(foundImg.mimetype);
           return res.send(foundImg.buffer);
        }
        else{
            res.status(404).send();
        }
    } 
    catch (err) {
        console.log(err);
       return res.status(500).send();
    }
});

//endpoint can support editorJS imageTool plugin, however, this may have poor data integrity (images saved without articles, etc)
//TODO: data integrity (creates new Image entry in db every time this runs);
router.post('/imgUploadFile', (req, res, next) => {
    upload(req, res, (err) => {
        //callback responses formatted for editorJS imageTool  plugin
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
        //current approach: database entry, and resulting api retrieval endpoint (currently decoupled data...)
        
        if (req.file) {
            let file = req.file;
            var img = new Image({ originalname: file.originalname, mimetype: file.mimetype, buffer: file.buffer, encoding: file.encoding });
            //TODO: check if image already exists?
            let wResult = await img.save();

            return res.status(201).send({ success: 1, file: { url: '/images/' + wResult._id } });
        }
        else {
            res.status(500).send({ success: 0 });
        }

    });

module.exports = router;