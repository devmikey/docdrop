var filesStored = localStorage.filesStored && JSON.parse(localStorage.filesStored) || [];

function beginUpload() {
        var formData = new FormData();
        var xhr = new XMLHttpRequest();
        var upload = xhr.upload;

        var onReady = function(e) {
            // ready state
            console.log(e);
        };

        var onError = function(err) {
            // something went wrong with upload
            console.log(err);
        };

        onProgress = function(e) {
            if(e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                if(percentage < 100) {
                    progress.style.width = percentage + "px";
                }
            }
        };

        var i, len, tmp = [];
        for(i = 0, len = filesStored.length; i < len; i += 1) {
            formData.append('fileno' +i, filesStored[i].file);
        }
        
        xhr.open("POST", "/upload", true);

        xhr.addEventListener('error', onError, false);
        xhr.addEventListener('progress', onProgress, false);
        xhr.send(formData);
        xhr.addEventListener('readystatechange', onReady, false); 
      
    }

    var DropUp = (function() {

        var target = document.getElementById("target");
        /* MSS additional functions */

        function makeDraggable(tag) {
            // make the files dragable to another application or the desktop
            var myfile = $(tag).find("a[class='dragme']")[0];
            var fileDetails;

            if(typeof myfile.dataset === "undefined") {
                // Grab it the old way
                fileDetails = myfile.getAttribute("data-downloadurl");
            } else {
                fileDetails = myfile.dataset.downloadurl;
            }

            myfile.addEventListener("dragstart", function(evt) {
                evt.dataTransfer.setData("DownloadURL", fileDetails);
            }, false);

        }

        function parseFile(file) {
            reader = new FileReader();
            var f = function(evt) {
                var fileFactory = new fileParserFactoryClass();
                var fileParser = fileFactory.create(file.type);
                fileParser.process(evt, file);
            };

            if(!hasStupidChromeBug()) {
                reader.addEventListener("loadend", f, false);
            } else {
                reader.onload = f;
            }

            reader.readAsText(file);
        }


        var fileParserFactoryClass = function() {
            return {
                create: function(filetype) {
                    switch(filetype) {
                        case "application/x-javascript":
                            return new jsonParser();
                            break;
                        case "text/plain":
                            return new txtParser();
                            break;
                        case "application/pdf":
                            return new pdfParser();
                            break;
                        case "text/html":
                            return new htmlParser();
                            break;
                        default:
                            return new defaultParser();
                    }

                }
            };
        };

        var defaultParser = function() {
            return {
                process: function(evt, file) {
                    console.log('unknown file type ' + file.type)
                }
            }
        }

        var jsonParser = function() {
            return {
                process: function(evt, file) {
                    var patObj = jQuery.parseJSON(evt.target.result);
                    var precis = $('#precis')
                    $(
              '<div><img id="portrait" width="27" height="27" title="" alt="patient picture" src ="'
              + 'data:image/jpeg;base64,' + patObj.patient.portrait + '"/>'
              + '<span class="precisdetails">Name: ' + patObj.patient.name + '</span>'
              + '<span class="precisdetails">DOB: ' + patObj.patient.dob + '</span>'
              + '<span class="precisdetails">Gender: ' + patObj.patient.gender + '</span></div>'
              + '<div>'
              + '<span>Address: ' + patObj.patient.address + '</span>'
              + '<span>Address: ' + patObj.patient.gppractice + '</span>'
              + '</div>'
              ).appendTo('#precis');
                }

            }
        }

        /* end of MSS additional functions */

        function addToFileStore(file) {
            filesStored.push({ "file": file, "date": (new Date()) });
            localStorage.filesStored = JSON.stringify(filesStored);
        }

        function removeFromFileStore(filename) {
            var i, len, tmp = [];
            for(i = 0, len = filesStored.length; i < len; i += 1) {
                if(filesStored[i].file.name !== filename) {
                    tmp.push(filesStored[i]);
                }
            }
            filesStored = tmp;
            localStorage.filesStored = JSON.stringify(filesStored);
        };

        function expireStored() {
            var i, len, now = new Date().getTime(), tmp = [];
            for(i = 0, len = filesStored.length; i < len; i += 1) {
                var time = new Date(filesStored[i].date).getTime();
                if((now - time) < 86400000) {
                    tmp.push(filesStored[i]);
                }
            }
            filesStored = tmp;
            localStorage.filesStored = JSON.stringify(filesStored);
        };

        function fileLoaded(event) {

            var file = event.target.file,
            $li = $(generateLi(file)),
            getBinaryDataReader = new FileReader();

            var li = $li.get(0),
            desc = $li.find(".desc").get(0),
            progress = $li.find(".progress").get(0);

            $li.find("img").attr("src", event.target.result);
            progress.style.width = "0%";

            $(target).append($li);

            var f = function(evt) {
                console.log("Starting upload of " + file.name)
                addToFileStore(file);
                parseFile(file);
            };

            if(!hasStupidChromeBug()) {
                getBinaryDataReader.addEventListener("loadend", f, false);
            } else {
                getBinaryDataReader.onload = f;
            }

            getBinaryDataReader.readAsBinaryString(file);
        };

        function drop(e) {
            var i, len, files, file;
            e.stopPropagation();
            e.preventDefault();
            files = e.dataTransfer.files;
            for(i = 0; i < files.length; i++) {
                file = files[i];
                if(file.size > (1048576 * 5)) {
                    $(target).append("<li class='item'><p class='error'>" +
                                 "5MB Limit</li></p>");
                    continue;
                }

                reader = new FileReader();
                reader.index = i;
                reader.file = file;
                if(!hasStupidChromeBug()) {
                    reader.addEventListener("loadend", fileLoaded, false);
                } else {
                    reader.onload = fileLoaded;
                }
                reader.readAsDataURL(file);
            }
        };

        function hasStupidChromeBug() {
            return typeof (FileReader.prototype.addEventListener) !== "function";
        };

        function generateLi(file) {
            var extension = file.name.split(".");
           
            var mimeClass = extension[1] ? extension[1] : ""
            var loadText = file.name ? file.name : "Uploading ...",
            loadClass = file.name ? "loaded" : "",
            imgSrc = file.name ? "src=\"/" + file.name + "\"" : "",
            imgHref = file.name ? "href=\"/" + file.name + "\"" : "",
            imgHtml = file.name ? "href=\"/" + file.name + "\"" : "";

            return '<li class="item ' + loadClass + '">' +
            '<div class="wrapper">' +
            '<a target="_blank" class="mimeUnknown ' + mimeClass + '" ' + imgHtml + '>' + '</a></div>' +
            '<div class="loading"><div class="progress"></div></div>' +
            '<p class="desc"><a class="dragme" target="_blank" ' + imgHtml + '>' + loadText + '</a>' +
            '<a class="remove" data-path="' + file.name + '">remove</a></p></li>';
        };

        function doNothing(e) {
            e.stopPropagation();
            e.preventDefault();
        };

        function displayStored() {
            var i, len, html = "";
            for(i = 0, len = filesStored.length; i < len; i += 1) {
               
                file = filesStored[i].file;
                html += generateLi(file);
            }
            target.innerHTML = html;
        };

        function removeClicked(e) {
            if(e.target.className === "remove") {
                removeFromFileStore(e.target.getAttribute("data-path"));
                $(e.target).parents(".item").fadeOut("medium", function() {
                    $(this).remove();
                });
            }
        };

        function init() {
            //expireStored();        
            displayStored();

            target.addEventListener("mousedown", removeClicked, false);

            document.addEventListener("dragenter", doNothing, false);
            document.addEventListener("dragover", doNothing, false);
            document.addEventListener("drop", drop, false);
        };

        return {
            "init": init
        };
    })();

 