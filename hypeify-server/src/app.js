const express = require('express');
const request = require("request");
const socketIO = require('socket.io');
const http = require('http');

var SpotifyWebApi = require("spotify-web-api-node");


const app = express();
let server = http.createServer(app);
let io = socketIO(server);

const port = 2500;

let mapOfActiveUsers = new Map();

class activeUser {
    constructor(access_token, name, room){
        this.access_token = access_token;
        this.name = name;
        this.room = room;
    }
}

var scopes = ["user-read-private", "user-read-email"],
    redirectUri = "http://localhost:2500/token",
    clientId = "508fba76b5c3412db876cbe71f7be4ba",
    state = "some-state-of-my-choice";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: "5a5859da6071432a9d12f3d02c437f7b"
});


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    next();
});

io.on('connection', async (socket) => {
    mapOfActiveUsers.set(socket.id, new activeUser(null ,'', -1));


    socket.on('disconnect', async () => {
        mapOfActiveUsers.delete(socket.id);
    });

});


app.get("/token", async (req, res) => {
    let access_token = '';
    
    try {
       // Retrieve an access token and a refresh token
        await spotifyApi.authorizationCodeGrant(req.query.code).then(
            function (data) {
                access_token =  data.body['access_token'];
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
       // res.send({sucessfulLogin: true, access_token: access_token});
    } catch (e) {
        console.log(e);
    }
});

app.get("/login", async (req, res) => {
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));