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
    constructor(access_token, socket, name, room, device){
        this.access_token = access_token;
        this.socket = socket
        this.name = name;
        this.room = room
        this.connectedDevice = device;
    }
}

var scopes = ["user-read-private", "user-read-email", "user-read-playback-state", "user-modify-playback-state"],
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
    mapOfActiveUsers.set(socket.id, new activeUser(lastAccessToken ,socket.id, '', generateRoomName(), null));
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
        activeUser.connectedDevice = myDevices.body.devices[0];
        mapOfActiveUsers.set(req.body.socket, activeUser);
        res.send(myDevices.body.devices);

    }catch(exception){
        console.log(exception);
    }
});

app.put("/selectSong", async(req, res) => {
    let activeUser = mapOfActiveUsers.get(req.body.user.socket);
    if (activeUser.connectedDevice.id == undefined) {
        res.send({sucessful: false, songInfo: {id: undefined, name: undefined, uri: undefined} });
    }

    try{
        await spotifyApi.refreshAccessToken();
        await spotifyApi.play({device_id: activeUser.connectedDevice.id, uris:  [req.body.songURI]});
        
        //The getcurrentPlayingTrack is too quick and may get the last playing song. We must wait for the previous request to go through
        await sleep(400);
        
        let result = await spotifyApi.getMyCurrentPlayingTrack();

        res.send({sucessful: true, songInfo: {id: result.body.item.id, name: result.body.item.name, uri: result.body.item.uri} });
    }catch(exception){
        console.log(exception);
    }
});

app.put("/getPlayLists", async(req, res) => {
    let activeUser = mapOfActiveUsers.get(req.body.user.socket);
    if (activeUser.connectedDevice.id == undefined) {
        res.send({sucessful: false, playListInfo: undefined });
    }

    try{
        await spotifyApi.refreshAccessToken();
        let result = await spotifyApi.getUserPlaylists();
        res.send({sucessful: true, playListInfo: result.body.items });
    }catch(exception){
        console.log(exception);
    }
});


app.put("/getPlayListsContents", async(req, res) => {
    let activeUser = mapOfActiveUsers.get(req.body.user.socket);
    if (activeUser.connectedDevice.id == undefined) {
        res.send({sucessful: false, playListInfo: undefined });
    }

    try{
        await spotifyApi.refreshAccessToken();
        let result = await spotifyApi.getPlaylistTracks(req.body.playListID);
        res.send({sucessful: true, playListInfo: result.body.items });
    }catch(exception){
        console.log(exception);
    }
});

app.get("/login", async (req, res) => {
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
});

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

server.listen(port, () => console.log(`Example app listening on port ${port}!`));