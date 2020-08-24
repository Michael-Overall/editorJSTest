const articleToHTML=(article)=> {
    var html = "";
    //TODO: article title?
    article.blocks.forEach(block => {
        switch (block.type) {
            case "header":
                html += `<h${block.data.level} class="h__article">${block.data.text}</h${block.data.level}>`;
                break;
            case "paragraph":
                html += `<p class="p__article">${block.data.text}</p>`;
                break;
            case "linkTool":
                //TODO
                throw new Error("linkTool html rendering not implemented");
                break;
            case "rawTool":
                html += `<section class="section__rawHTML">${block.data.html}</section>`;
                break;
            case "image":
                //TODO: handle border, background, streched props?
                html += `${block.data.caption ? '<figure class="fig__article">' : ''}` +
                    `<img class="img__article" src="${block.data.file.url}">` +
                    `${block.data.caption ? '<figcaption class="figcaption__article">' + block.data.caption + '</figcaption>' : ''}` +
                    `${block.data.caption ? '</figure>' : ''}`;
                break;
            case "list":
                html+= `${block.data.style == "unordered"? '<ul class="ul__article">' : '<ol class="ol__article">'}`;
                block.data.items.forEach(itemText=>{
                    html+= `<li>${itemText}</li>`;
                });
                html+=`${block.data.style == "unordered"? '</ul>' : '</ol>'}`;
                break;
            case "embed":
                throw new Error("embedded items: html rendering not implemented");

                break;
            case "quote":
               html+=` <div class = "div__quote">`+
                    `<p class="p__quoteText" style="text-align: ${block.data.alignment};">${block.data.text}</p>`+
                   ` <p class = "p__quoteCaption">${block.data.caption}</p>`+
                `</div>`

                break;
            default:
                html += '';

        }
    });
    return html;
}

module.exports= articleToHTML;