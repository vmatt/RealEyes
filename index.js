var express = require('express'),
		https= require('https'),
		http= require('http'),
		fs = require("fs"),
		AWS = require("aws-sdk"),
		formidable = require("formidable"),
		path = require("path"),
		app = express();



app.use(function(req, res, next) {
    console.log('Direct URL request: "%s"', req.originalUrl);
    next();
}, express.static('.'));

app.post('/upload', function(req, res){
  var form = new formidable.IncomingForm();
  form.multiples = false;
  form.uploadDir = path.join(__dirname, '/img');
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
			console.log(form);
  });
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });
  form.on('end', function() {
    res.end('success');
  });

  form.parse(req);

});
var httpsOptions={
		ca:fs.readFileSync("../certs/ca_bundle.crt"),
		cert:fs.readFileSync("../certs/certificate.crt"),
		key:fs.readFileSync("../certs/private.key")
};
var server = https.createServer(httpsOptions,app);
server.listen(443, function () {
  var port = server.address().port
	console.log("RealEyes Backend listening on port %s", port);
  })

/*
// Read in the file, convert it to base64, store to S3
fs.readFile('img/1.jpg', function (err, data) {
  if (err) { throw err; }

  var base64data = new Buffer(data, 'binary');
	console.log(base64data);
  var s3 = new AWS.S3();
  s3.putObject({
    Bucket: 'valqrealeyes',
    Key: '7.jpg',
    Body: base64data,
    ACL: 'public-read'
  },function (resp) {
    console.log(arguments);
    console.log('Successfully uploaded package.');

  });

});
function runRekognition(){
	var params = {
  Image:{
      S3Object:{
         Bucket:"valqrealeyes",
         Name:"7.jpg"
      }
   }
 };
var rekognition = new AWS.Rekognition({region:"eu-west-1"});
rekognition.detectFaces (params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data.FaceDetails); });
}
 */
