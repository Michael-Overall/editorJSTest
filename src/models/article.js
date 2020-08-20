const mongoose = require('mongoose');

const {blockSchema} = require('./block');

const articleSchema = new mongoose.Schema({
    time: {
        //remember to use document.markModified('time') after changing this value
        type: Date,
        required: true
    },
    blocks: [blockSchema],
    version: {
        type: String
    }
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;