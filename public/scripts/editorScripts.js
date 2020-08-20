function editorSubmit() {
    if (editor) {
        editor.save().then((editorData) => {
            console.log(editorData);
            var xmlHttpReq = new XMLHttpRequest();
            xmlHttpReq.onreadystatechange = () => {
                if (xmlHttpReq.readyState === XMLHttpRequest.DONE) {
                    var status = xmlHttpReq.status;
                    let editorResults = document.getElementById("p__editorResults");
                    if (status === 0 || (status >= 200 && status < 400)) {
                        editorResults.style.color = "green";
                        editorResults.innerHTML = "Successfully saved article <br><br><hr>"+xmlHttpReq.responseText;
                    }
                    else{
                        editorResults.style.color = "red";
                        editorResults.innerHTML = status+": failed saving the article.<br><br><hr>"+xmlHttpReq.responseText;
                    }
                }
            }
            //TODO: make this https when implementing in production (also require authenticated session or other alternative)
            let reqURL = "http://localhost:3001/saveArticle";   
            let pgURLSegs = window.location.href.split('/');
            let lastSeg = pgURLSegs.pop() || pgURLSegs.pop();
            if(lastSeg != "editor"){
                reqURL+= '/'+lastSeg;
            }
            console.log("reqURL is:", reqURL);
            xmlHttpReq.open("POST", reqURL);
            xmlHttpReq.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            xmlHttpReq.send(JSON.stringify(editorData));
        }).catch((error) => {
            console.log(error);
            let editorResults = document.getElementById("p__editorResults");
            editorResults.style.color = "red";
            editorResults.innerHTML = "Error generating article save data!";
        })

    }
}