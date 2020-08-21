const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    originalname: {
        type: String
    },
    mimetype: {
        type: String,
        required: true
    },
    buffer: {
        type: Buffer,
        required: true
    },
    encoding: {
        type: String,
        required: true
    }

});

const Image =  mongoose.model('Image', imageSchema);

module.exports = Image;