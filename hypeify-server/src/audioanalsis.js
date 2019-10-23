var { Timer } = require('easytimer.js');
var express = require('express'),
    http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);



io.sockets.on("connection", function(socket){
    var timer = new Timer();
    timer.start({precision: 'secondTenths'});

    timer.addEventListener('secondTenthsUpdated', function (e) {
      // console.log(timer.getTotalTimeValues().secondTenths);
        if (timer.getTotalTimeValues().secondTenths >= musicData.tatums[0].start * 10){
            if (musicData.tatums[0].confidence >= 0.2 && musicData.tatums[0].duration >= 0.2 ) {
                console.log("Emiting at " + musicData.tatums[0].start + " my local time is " + timer.getTotalTimeValues().secondTenths.toString());
                if (musicData.tatums[0].duration >0.3){
                    musicData.tatums[0].color = "green";
                }else{
                    musicData.tatums[0].color = "blue";
                }
                socket.emit("beat", musicData.tatums[0]);
           }
           
            musicData.tatums.shift(); 
        }
        if (timer.getTimeValues().seconds > musicData.track.duration){
            console.log("Done the song!")
            return;
        }
    });   
});

server.listen(8000);