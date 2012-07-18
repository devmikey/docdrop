var fs = require('fs');
var itkclient = require('../lib/itkservice');

/*
* This module is is responsible for handling the home page routes, including displaying the upload box and handling file uploads
*/

// event handler triggered once the manifest has been built
var manifestLoaded = function(manifestItem, res){
    itkclient.send(manifestItem, function(ctx) {
		console.log("jigsaw responded " +ctx.response );
        res.send(manifestItem[0].filename);
    });     
}

// base64 encoder
function getBase64Attachment(file, target_path, callback){
   var base64data;
   console.log('read file  = '+ target_path)
   fs.readFile(target_path, function(err, data) {
       if(err) {
           console.log('Error encoding file  = ' + err);
           return callback(err);
       }

       base64data = new Buffer(data).toString('base64');
       var attachment = { "mimetype": file.type, "filename": file.name, "data": base64data , "base64": "true"};
       return callback(null, attachment);
   });
}


module.exports = function(app) {

    // home page
    app.get("/", function(req, res) {
        res.render('index', { title: 'Doc Drop',
            note: 'Docs on the move need Doc Drop, drop a document and go',
            layout: 'layout',
            scripts: ['/scripts/jquery-1.7.min.js', '/scripts/modernizr-1.5.min.js', '/scripts/client.dropup.js']
        });
    });

    app.post("/upload", function(req, res) {

        // get the temporary location of the file
		var uploaded = req.files;
        var manifestArray = new Array();
        var manifestItem = new Array();
        for(fileref in uploaded) {
            manifestArray.push(uploaded[fileref]);
        }

        var renameFiles = function(index) {
            if(index == manifestArray.length) {
                manifestLoaded(manifestItem, res);
            } else {
                file = manifestArray[index];
                target_path = __dirname + '/../documents/' + file.name;
                tmp_path = file.path;
                console.log('renaming ' + tmp_path + ' to ' +target_path)
				
                fs.rename(tmp_path, target_path, function(error) {
                    if(error) {
                        console.log("Error renaming file. ", error);
                        throw error;
                    } else {
                        getBase64Attachment(file, target_path, function(error, attachment) {
                            if(error) {
                                console.log("Error reading file. ", error);
                                throw error;
                            } else {
								console.log('adding file to manifest')
                                manifestItem.push(attachment);
                                renameFiles(index + 1);
                            }
                        });
                    }
                });
            }
        }
        renameFiles(0);
    });  // end of app.post('/upload

} // end of export
