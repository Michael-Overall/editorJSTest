const express = require('express');

const Article = require('../models/article');
const { Block } = require('../models/block');



const articleToHTML = require('../helpers/articleToHTML');


const router = new express.Router();

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

router.post('/saveArticle/:id?', async (req, res) => {
    //remember: req.body is undefined by default unless you use middleware like body-parser, or multer.
    //files/images are associated to articles only by URIs--they are separate uploads even if uploaded through editorJS
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
//assumes any files referenced in article are independent of article (must be deleted separately)
router.delete("/article/:id", async (req, res)=>{
 if(req.params.id){
     try{
        let article = await Article.findOneAndDelete({_id: req.params.id});
        if(!article){
            return res.status(404).send();
        }
        res.send(article);
     }
     catch(err){
         console.log("DELETE article error:", err);
        res.status(500).send(err);
     }
 }
});

module.exports = router;