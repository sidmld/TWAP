
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var five = require("johnny-five");
var path = require("path");
var board, servo, led, sensor;



board = new five.Board();


board.on("ready", function() {

  
  led = new five.Led(13).strobe(1000);

  
  servo = new five.Servo({
    pin:6,
    range: [0,180],
    type: "standard",
    center:true
  });

 
  sensor = new five.Sensor({
    pin: "A0",
    freq: 58
  });

});


app.listen(3000);



function handler (request, response) {

var filePath = '.' + request.url;
if (filePath == './')
  filePath = './index.html';

var extname = path.extname(filePath);
var contentType = 'text/html';
switch (extname) {
  case '.js':
    contentType = 'text/javascript';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  case '.json':
    contentType = 'application/json';
    break;
  case '.png':
    contentType = 'image/png';
    break;      
  case '.jpg':
    contentType = 'image/jpg';
    break;
  case '.wav':
    contentType = 'audio/wav';
    break;
}

fs.readFile(filePath, function(error, content) {
  if (error) {
    if(error.code == 'ENOENT'){
      fs.readFile('./404.html', function(error, content) {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
      });
    }
    else {
      response.writeHead(500);
      response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      response.end(); 
    }
  }
  else {
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  }
});
};



io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
 
  
  if(board.isReady){
    
    sensor.on("data",function(){
      socket.emit('sensor', { raw: this.raw });
    });
  }

  
  socket.on('servo', function (data) {
    console.log(data);
    if(board.isReady){ servo.to(data.pos);  }
  });
 
  socket.on('led', function (data) {
    console.log(data);
     if(board.isReady){    led.strobe(data.delay); } 
  });

});
