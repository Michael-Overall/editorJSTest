const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
//url:
size: {
    type: Number
},
buffer: {
    type: Buffer,
    required: true
},
originalname: {
    type: String,
    required: true
},
mimetype:{
    type: String,
    required: true
},
encoding:{
    type: String,
    required: true
}
});

const Attachment = mongoose.model('Attachment', attachmentSchema);

module.exports = Attachment;