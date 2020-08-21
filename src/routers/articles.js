const express = require('express');
const hbs = require('hbs');
const path = require('path');
const multer = require('multer');

const Article = require('../models/article');
const { Block } = require('../models/block');
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

const articleToHTML = require('../helpers/articleToHTML');

router.get('/articles', async (req, res) => {
    //TODO: experiment w/ pagination, filters etc
    var articles = await Article.find().sort({ time: -1 });

    if (articles) {
        res.render('articleList', { articles: articles });
    }
    else {
        res.status(404).send();
    }
});
router.get('/article/:id', async (req, res) => {
    var article = {};
    var html = "";
    if (req.params.id) {
        try {
            article = await Article.findOne({ _id: req.params.id });
            if (article) {
                html = articleToHTML(article);
                return res.render('article', { html: html });
            }

        }
        catch (err) {
            console.log(err);
            return res.status(500).send(`<p>${err}</p>`);

        }
    }
    return res.status(404).send();
});
router.get('/images/:id', async (req, res) => {
    try {
        let id = req.params.id;
        var foundImg = await Image.findById(id);
        if (foundImg) {
            console.log("get: foundImg:", foundImg);
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
})
router.get('/editor/:id?', async (req, res) => {
    var dat = {};
    if (req.params.id) {
        try {
            //try to get article from db
            const article = await Article.findOne({ _id: req.params.id });
            if (!article) {
                return res.status(404).send();
            }
            dat = article;
        }
        catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }

    res.render('editor', { editorData: JSON.stringify(dat) });
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
        console.log(">DEBUG: req.file:", req.file);
        if (req.file) {
            let file = req.file;
            var img = new Image({ originalname: file.originalname, mimetype: file.mimetype, buffer: file.buffer, encoding: file.encoding });
            //TODO: check if image already exists?
            let wResult = await img.save();
            console.log(wResult);

            return res.status(201).send({ success: 1, file: { url: '/images/' + wResult._id } });

        }
        else {
            res.status(500).send({ success: 0 });
        }

    });

router.post('/saveArticle/:id?', async (req, res) => {
    //remember: req.body is undefined by default unless you use middleware like body-parser, or multer.
    //TODO: how to we ensure uploaded images are associated properly with articles? This is a separate request!!
    var article = null;
    var rawArticle = req.body;
    if (req.params.id) {
        try {
            let article = await Article.findOne({ _id: req.params.id });
            if (!article) {
                console.log("article,", req.params.id, " not found!");
                return res.status(404).send();
            }
            console.log("found article");
            article.time = rawArticle.time;
            article.markModified('time');
            //manually delete all blocks so they can be re-produced/re-populated from page blocks:
            for (let i = article.blocks.length; i > 0; i--) {
                article.blocks.remove(article.blocks[i - 1]);
            }
            rawArticle.blocks.forEach((block) => {
                var blk = new Block({ type: block.type, data: block.data });
                article.blocks.push(blk);
            });
            article.markModified('blocks');
            let wResult = await article.save();
            console.log("article saved!");
            return res.status(200).send(JSON.stringify(wResult));
        }
        catch (err) {
            console.log("error: ", err);
            res.status(500).send(err);
        }
    }
    else {

        try {


            //note that spread operator with nested data does not seem to work--> manually set nested array data as below:
            //var article = new Article(...rawArticle);
            article = new Article({ time: rawArticle.time, version: rawArticle.version });
            rawArticle.blocks.forEach((block) => {
                var blk = new Block({ type: block.type, data: block.data });
                article.blocks.push(blk);
            });
            let wResult = await article.save();
            return res.status(200).send(JSON.stringify(wResult));

        }
        catch (err) {
            console.log(err);
            return res.sendStatus(500);
        }
    }
});

module.exports = router;