/**
* MODULE DEPENDENCIES
* -------------------------------------------------------------------------------------------------
* include any modules you will use through out the file
**/

var connect = require('connect');
var express = require('express');

var port = process.env.PORT || 4000;
var app = module.exports = express.createServer();

/**
* CONFIGURATION
* -------------------------------------------------------------------------------------------------
* set up any custom middleware (errorHandler), custom Validation (signatureValidator)
**/
console.log('starting server');
app.configure(function() {

console.log('app init');
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser({ uploadDir: __dirname + '/uploads' }));
    //app.use(express.methodOverride());
    app.use(connect.static(__dirname + '/public'));
    app.use(app.router);
	
	console.log('app configured');
	
});

require('./routes/home')(app);
app.listen(port);