'use strict';
function sendImage(data) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log("success");
    }
  };
  xhttp.open("POST", "/backend/upload", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("imgInBase64="+data);
}

var video = document.querySelector('video');
var canvas = window.canvas = document.querySelector('canvas');

var button = document.querySelector('button');
button.onclick = function() {
  var context = canvas.getContext('2d');
  if (video) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    var data = canvas.toDataURL('image/png');
    canvas.setAttribute('src', data);
    sendImage(data);
  } else {
    clearphoto();
  }
};

var constraints = {
  audio: false,
  video: {
    width: {
      max: 320
    },
    height: {
      max: 240
    }
  }

};

function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
