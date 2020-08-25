# EditorJSTest

- This repo exists to mess with leveraging the EditorJS npm packages and plugins into a basic CMS (Content Management System). The back end consists of an expressJS server which persists data in mongoDB, and generates pages via the express-handlebars templating engine. A mongoDB installation is required (requires addition of connection string if you've added authorization to mongoDB).
- Any semblance of page styling is either your browser doing its best, or a figment of your imagination.



## Features

- 'Article' CRUD with supporting EditorJS editor interface
- image and file upload and browsing



## editorJS Plugins/Blocks

- Header
- Paragraph
- Quote
- Image
- ~~Embed~~ (Use raw HTML (rawTool) instead; it's more reliable and doesn't require parsing every kind of embed from editorJS blocks to something that can be used on the front end)
- Raw HTML ('rawTool')
- File attachments/uploads ('attaches')
- Link previews (needs to be implemented)

