<<<<<<< HEAD
const express = require('express')
=======
const express = require("express");
const request = require("request");
var SpotifyWebApi = require("spotify-web-api-node");
>>>>>>> 4442149cabd5b75c92a4fbed05df31935d933af3
const app = express();
const port = 3000;
const spotifyapi = require("spotify-web-api-node");
var querystring = require("querystring");
const my_client_id = "508fba76b5c3412db876cbe71f7be4ba";
var client_secret = "5a5859da6071432a9d12f3d02c437f7b";
const redirect_uri = "http://localhost:3000/";

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/login", function(req, res) {
  var scopes = ["user-read-private", "user-read-email"],
    redirectUri = "https://localhost/",
    clientId = "508fba76b5c3412db876cbe71f7be4ba",
    state = "some-state-of-my-choice";

  // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
  });

  // Create the authorization URL
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
  console.log(authorizeURL);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
