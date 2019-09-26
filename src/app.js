const express = require('express')
const app = express();
const port = 3000;
const spotifyapi = require('spotify-web-api-node');
var querystring = require('querystring');
const my_client_id = '55e9eac11b1149f6b30c7733b52058f6';
var client_secret = 'a67b8d15653a4b88a5d0a83664e63de0';
const redirect_uri = 'https://localhost:3000/';

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/login', function (req, res) {

	//cant break line scopes
	var scopes = 'user-read-private user-read-email playlist-read-collaborative playlist-modify-private playlist-modify-public playlist-read-private user-modify-playback-state user-read-currently-playing user-read-playback-state user-library-modify user-library-read user-follow-modify user-follow-read user-read-recently-played user-top-read streaming app-remote-control';
		
	res.redirect('https://accounts.spotify.com/authorize' +
		'?response_type=code' +
		'&client_id=' + my_client_id +
		(scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
		'&redirect_uri=' + encodeURIComponent(redirect_uri));
});
	

app.listen(port, () => console.log(`Example app listening on port ${port}!`));