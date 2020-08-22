const express = require('express');
const hbs = require('hbs');
const path = require('path');
var bodyParser = require('body-parser');

const mongodb = require('mongodb');
const connectionURL = 'mongodb://127.0.0.1:27017';
const dbName = 'article-manager';
process.env.MONGO_URL = connectionURL;
process.env.MONGO_DB_NAME = dbName;
require('./db/mongoose');
const Article = require('./models/article');
const { Block } = require('./models/block');

hbs.registerPartials(path.join(__dirname, "/../public/templates/partials"));


const app = express();
app.set('view engine', 'hbs');
app.set('views', __dirname + '/../public/templates/views');
//1st arg is a virtual path to mount static assets to so that this path can be requested via the front end
app.use('/editorjs', express.static(__dirname + '/../node_modules/@editorjs/editorjs/dist'));
app.use('/editorjs/header', express.static(__dirname + '/../node_modules/@editorjs/header/dist'));
app.use('/editorjs/embed', express.static(__dirname + '/../node_modules/@editorjs/embed/dist'));
app.use('/editorjs/image', express.static(__dirname + '/../node_modules/@editorjs/image/dist'));
app.use('/editorjs/link', express.static(__dirname + '/../node_modules/@editorjs/link/dist'));
app.use('/editorjs/list', express.static(__dirname + '/../node_modules/@editorjs/list/dist'));
app.use('/editorjs/quote', express.static(__dirname + '/../node_modules/@editorjs/quote/dist'));
app.use('/editorjs/raw', express.static(__dirname + '/../node_modules/@editorjs/raw/dist'));
app.use('/scripts', express.static(__dirname + '/../public/scripts'));

app.use(bodyParser.json());
//you may want to add support for css, text/calendar, etc, here if expanding code to become a more fully functional CMS 
const validFileMimetypes = ["image/gif", "image/bmp", "image/jpeg", "image/png", "image/svg+xml", "image/tiff", "image/webp"];
process.env.VALID_FILE_MIMETYPES = validFileMimetypes;


const articleRouter = require('./routers/articles');
app.use(articleRouter);
const imageRouter = require('./routers/images');
app.use(imageRouter);

console.log("server is listening on localhost:3001. check routers directory for valid endpoints");
app.listen(3001);