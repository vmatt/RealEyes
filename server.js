"use strict";
var express = require('express'),
		https= require('https'),
		http= require('http'),
		fs = require("fs"),
		path = require("path"),
		awsController = require("./awsController.js"),
		fileHandler = require("./fileHandler.js"),
		app = express();

app.post('/backend/upload', function(req, res){
	if (req.method == 'POST') {
	        console.log("POST");
	        var body = '';
	        req.on('data', function (data) {
	            body += data;
	        });
	        req.on('end', function () {
						new fileHandler(body);
	        });
	        res.writeHead(200, {'Content-Type': 'text/html'});
	        res.end('Upload successful');
	    }
});

app.use(function(req, res, next) {
    console.log('Direct URL request: "%s"', req.originalUrl);
    next();
}, express.static('.'));

var httpsOptions={
		ca:fs.readFileSync("../certs/ca_bundle.crt"),
		cert:fs.readFileSync("../certs/certificate.crt"),
		key:fs.readFileSync("../certs/private.key")
};
var server = https.createServer(httpsOptions,app);

server.listen(4433, function () {
  var port = server.address().port
	console.log("RealEyes Backend listening on port %s", port);
  })

http.createServer(function (req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(8080);
