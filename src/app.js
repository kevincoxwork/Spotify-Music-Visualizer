const express = require("express");
var request = require("request");

var SpotifyWebApi = require("spotify-web-api-node");
const app = express();
const port = 3000;

var scopes = ["user-read-private", "user-read-email"],
    redirectUri = "http://localhost:3000/token",
    clientId = "508fba76b5c3412db876cbe71f7be4ba",
    state = "some-state-of-my-choice";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: "5a5859da6071432a9d12f3d02c437f7b"
});

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/token", async (req, res) => {

    try {
       // Retrieve an access token and a refresh token
        await spotifyApi.authorizationCodeGrant(req.query.code).then(
            function (data) {
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

        await spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE')
        .then(function (data) {
            console.log('Artist albums', data.body);
        }, function (err) {
            console.error(err);
        });


        console.log(await spotifyApi.getMyDevices());

    } catch (e) {
        console.log(e);
    }

});

app.get("/login", async (req, res) => {


    // Create the authorization URL
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
    console.log(authorizeURL);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));