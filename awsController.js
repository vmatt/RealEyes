"use strict";
var fs = require("fs"),
    aws = require("aws-sdk"),
    path = require("path");

class awsController {
  constructor(binaryData) {
    this.binaryData=binaryData;
  }
  runRekognition(){
  	var params = {
    Image:{
        Bytes:this.binaryData,
     }
   };
  var rekognition = new aws.Rekognition({region:"eu-west-1"});
  rekognition.detectFaces (params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data.FaceDetails); });
  }
}
module.exports = awsController;
