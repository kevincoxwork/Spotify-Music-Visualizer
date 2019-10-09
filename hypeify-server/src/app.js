const express = require('express');
const request = require("request");
var cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser')

var SpotifyWebApi = require("spotify-web-api-node");


const app = express();


const allowedOrigins = ['http://localhost:3000',
                      'http://localhost:2500'];
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }

}));

app.use(bodyParser.json());


let server = http.createServer(app);
let io = socketIO(server);

const port = 2500;

let mapOfActiveUsers = new Map();

class activeUser {
    constructor(access_token, socket, name, room){
        this.access_token = access_token;
        this.socket = socket
        this.name = name;
        this.room = room;
    }
}

var scopes = ["user-read-private", "user-read-email", "user-read-playback-state"],
    redirectUri = "http://localhost:2500/token",
    clientId = "508fba76b5c3412db876cbe71f7be4ba",
    state = "some-state-of-my-choice";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: "5a5859da6071432a9d12f3d02c437f7b"
});


generateRoomName = () =>{
    return Math.random().toString(36).substring(9);
}


io.on('connection', async (socket) => {
    console.log("connected");
    mapOfActiveUsers.set(socket.id, new activeUser(lastAccessToken ,socket.id, '', generateRoomName()));
    //this is where we should pass room information
    socket.emit('connectedSuccessfully', mapOfActiveUsers.get(socket.id));

    socket.on('disconnect', async () => {
        console.log("disconnected");
        mapOfActiveUsers.delete(socket.id);
    });

});

let lastAccessToken;
app.get("/token", async (req, res) => {    
    try {
       // Retrieve an access token and a refresh token
        await spotifyApi.authorizationCodeGrant(req.query.code).then(
            function (data) {
                lastAccessToken =  data.body['access_token'];
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The access token is ' + data.body['access_token']);
                console.log('The refresh token is ' + data.body['refresh_token']);

                // Set the access token on the API object to use it in later calls
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
            },
            function (err) {
                console.log('Something went wrong!', err);
            }
        );

        // await spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE')
        // .then(function (data) {
        //     console.log('Artist albums', data.body);
        // }, function (err) {
        //     console.error(err);
        // });

        res.redirect("http://localhost:3000/party");
    } catch (e) {
        console.log(e);
    }
});

app.put("/spotifyDeviceInfo", async(req, res) => {

    let activeUser = mapOfActiveUsers.get(req.body.socket);
    try{
        await spotifyApi.refreshAccessToken();
        let myDevices = await spotifyApi.getMyDevices();
        res.send(myDevices.body.devices);
    }catch(exception){
        console.log(exception);
    }

  
});

app.get("/login", async (req, res) => {
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
});

server.listen(port, () => console.log(`Example app listening on port ${port}!`));