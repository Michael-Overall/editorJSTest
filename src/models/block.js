const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            let validTypes = ['header', 'paragraph', 'list', 'linkTool', 'rawTool', 'image', 'embed', 'quote'];
            if(!(validTypes.includes(value.trim()))){
                throw new Error('Invalid block type specified!');
            }
        }
    },
    //MongooseMap type: allow for variety of block types/data (requires mongoose 5.10+)
    data: {
        //empty object literal provides 'Schema.Types.Mixed' type
        type: {mixed: String},

        // //can't be String as some values are Boolean.
        //trying to use type: Map makes items difficult for handlebars templates to access
        //type: Map,
        // of: {}
    }
});

const Block = mongoose.model('Block', blockSchema)
module.exports = {Block, blockSchema};