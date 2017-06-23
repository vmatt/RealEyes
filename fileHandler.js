var fs = require("fs");

class fileHandler {
  constructor(base64){
    this.base64=base64;
    console.log(this.base64);
    this.decodeBase64Image();
  }
  decodeBase64Image() {
    var matches = this.base64.match(/^data:image\/png;base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    console.log(imageBuffer);
  }



}
module.exports=fileHandler;
