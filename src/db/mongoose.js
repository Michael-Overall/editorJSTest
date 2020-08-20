const mongoose = require('mongoose');
//const validator = require('validator');


mongoose.connect(process.env.MONGO_URL + "/" + process.env.MONGO_DB_NAME, {
    useNewUrlParser: true,
    //ensures that when mongoose is used with mongodb, new indexes are created
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
