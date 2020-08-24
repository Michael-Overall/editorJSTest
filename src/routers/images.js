const express = require('express');
const multer = require('multer');
const nodeFetch = require('node-fetch');
const fileType = require('file-type');
const sharp = require('sharp');

const Image = require('../models/image');


//TODO: cap file size if implementing in production environment
var imgUpload = multer(
    {
        //dest: "../uploads/",
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (process.env.VALID_IMG_FILE_MIMETYPES.includes(file.mimetype)) {
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
        else {
            res.status(404).send();
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});
router.get('/imgThumbs/:id', async (req, res) => {
    try{
        let id = req.params.id;
        let dbImg = await Image.findById(id);
        if(!dbImg){
            return res.status(404).send();
        }
        //you should implement proportionate aspect-ratio thumbnails...
        let thumb = await sharp(dbImg.buffer).resize(200, 200).toBuffer();
        res.contentType(dbImg.mimetype);
        return res.send(thumb);
    }
    catch(err){
        console.log(err);
        return res.status(500).send();
    }
});
router.get('/imageList/:page?', async (req, res) => {
    try {
        var itmsPerPg = 2; //15;
        var numPgs = 0;
        var page = parseInt(req.params.page) || 1;
        page = page <= 0 ? 1 : page;
        var images = await Image.find()
            .select('_id originalname')
            .limit(itmsPerPg)
            .skip(itmsPerPg * (page - 1));
        if (!images) {
            return res.status(404).send();
        }
        let totalImgs = await Image.estimatedDocumentCount();
        numPgs = totalImgs / itmsPerPg;
        return res.render('imgList', { images: images, numPgs: numPgs });
    }
    catch (err) {
        console.log(err);
        res.status(500).send();
    }
});

//endpoint can support editorJS imageTool plugin, however, this may have poor data integrity (images saved without articles, etc)
//TODO: data integrity (creates new Image entry in db every time this runs);
router.post('/imgUploadFile', (req, res, next) => {
    imgUpload(req, res, (err) => {
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

router.post('/imgByUrl', async (req, res) => {
    try {

        var resp = await nodeFetch(req.body.url);
        if (resp.status >= 200 && resp.status < 400) {
            let buff = await resp.buffer();
            let filetype = await fileType.fromBuffer(buff);
            if (!process.env.VALID_IMG_FILE_MIMETYPES.includes(filetype.mime)) {
                return res.status(400).send({ success: 0 });
            }
            //node-fetch may default to utf-8 for response format? if so, this code will work consistently... if not, this needs to be fixed.
            var img = new Image({ originalname: 'fromPastedUrl.' + filetype.ext, mimetype: filetype.mime, buffer: buff, encoding: '7bit' });
            let wResult = await img.save();
            return res.send({ success: 1, file: { url: '/images/' + wResult._id } });
        }
        else {
            res.status(resp.status).send({ success: 0 });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});
router.delete('/images/:id', async (req, res) => {
    try {
        console.log("DELETE:", req.params.id);
        if(req.params.id){
        let image = await Image.findOneAndDelete({ _id: req.params.id });
        if (!image) {
            return res.status(404).send();
        }
        return res.send();
    }
    return res.status(400).send();
    }
    catch (err) {
        console.log(err);
       return res.status(500).send();
    }
});

module.exports = router;