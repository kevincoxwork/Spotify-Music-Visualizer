const express = require("express");
const request = require("request");
const cors = require("cors");
const {
  Timer
} = require("easytimer.js");
const socketIO = require("socket.io");
const http = require("http");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:2500"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  })
);

app.use(bodyParser.json());

let server = http.createServer(app);
let io = socketIO(server);

const port = 2500;

let mapOfActiveUsers = new Map();

class activeUser {
  constructor(access_token, socket, name, room, device) {
    this.access_token = access_token;
    this.socket = socket;
    this.name = name;
    this.room = room;
    this.connectedDevice = device;
  }
}

var scopes = [
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
    "user-modify-playback-state"
  ],
  redirectUri = "http://localhost:2500/token",
  clientId = "508fba76b5c3412db876cbe71f7be4ba",
  state = "some-state-of-my-choice";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: "5a5859da6071432a9d12f3d02c437f7b"
});

generateRoomName = () => {
  return Math.random()
    .toString(36)
    .substring(9);
};

io.on("connection", async socket => {
  console.log("connected");
  mapOfActiveUsers.set(
    socket.id,
    new activeUser(lastAccessToken, socket.id, "", generateRoomName(), null)
  );
  //this is where we should pass room information
  socket.emit("connectedSuccessfully", mapOfActiveUsers.get(socket.id));

  socket.on("disconnect", async () => {
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
        lastAccessToken = data.body["access_token"];
        console.log("The token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);
        console.log("The refresh token is " + data.body["refresh_token"]);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
    res.redirect("http://localhost:3000/party");
  } catch (e) {
    console.log(e);
  }
});

async function getAudioAnalysis(trackURI) {
  (tokens = trackURI.split(":").slice(2)), (trackURI = tokens.join("."));
  let result = await spotifyApi.getAudioAnalysisForTrack(trackURI);

  return result;
}

let timer;
let savedmusicData;
async function visualizeMusic(musicData, startTime) {

  if (timer !== undefined) {
    timer.removeEventListener("secondTenthsUpdated", secondTenthsUpdated);
  }

  timer = new Timer();
  timer.start({
    precision: "secondTenths",
    startValues: {
      secondTenths: startTime / 100
    }
  });

  if (musicData !== undefined)
    savedmusicData = musicData.body;

  timer.addEventListener("secondTenthsUpdated", secondTenthsUpdated);
}

function secondTenthsUpdated() {
  if (
    timer.getTotalTimeValues().secondTenths >=
    savedmusicData.beats[0].start * 10
  ) {
    if (
      savedmusicData.beats[0].confidence >= 0.2 &&
      savedmusicData.beats[0].duration >= 0.1
    ) {
      console.log(
        "Emiting at " +
        savedmusicData.beats[0].start +
        " my local time is " +
        timer.getTotalTimeValues().secondTenths.toString()
      );
      // if (musicData.tatums[0].duration >0.3){
      //     musicData.tatums[0].color = "green";
      // }else{
      //     musicData.tatums[0].color = "blue";
      // }
      // //socket.emit("beat", musicData.tatums[0]);
      // console.log(musicData.tatums[0]);
    }

    savedmusicData.beats.shift();
  }
  if (timer.getTimeValues().seconds > savedmusicData.track.duration) {
    console.log("Done the song!");
    return;
  }
}

async function resumeVisualzingMusic() {

  if (timer !== undefined) {
    timer.start();
  }

}

async function pauseVisualingMusic() {
  if (timer !== undefined) {
    timer.pause();
  }


}


app.put("/spotifyDeviceInfo", async (req, res) => {
  let activeUser = mapOfActiveUsers.get(req.body.socket);
  try {
    await spotifyApi.refreshAccessToken();
    let myDevices = await spotifyApi.getMyDevices();
    activeUser.connectedDevice = myDevices.body.devices[0];
    mapOfActiveUsers.set(req.body.socket, activeUser);
    res.send(myDevices.body.devices);
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/skipTrack", async (req, res) => {
  try {
    await spotifyApi.refreshAccessToken();

    if (req.body.skipToNext) {
      await spotifyApi.skipToNext();
    } else {
      await spotifyApi.skipToPrevious();
    }
    await pauseVisualingMusic();
    //The getcurrentPlayingTrack is too quick and may get the last playing song. We must wait for the previous request to go through
    await sleep(400);

    let result = await spotifyApi.getMyCurrentPlayingTrack();

    res.send({
      sucessful: true,
      songInfo: {
        id: result.body.item.id,
        name: result.body.item.name,
        uri: result.body.item.uri
      }
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/seekForward", async (req, res) => {

  //get this from the request
  const timeToSkipAheadBy = 1000;

  try {
    await spotifyApi.refreshAccessToken();
    let progress = undefined;
    let currentPlayingTrack = await spotifyApi.getMyCurrentPlayingTrack();
    progress = {
      time: currentPlayingTrack.body.progress_ms,
      duration: currentPlayingTrack.body.item.duration_ms
    };
    let skip = false;
    let newTime = progress.time + timeToSkipAheadBy;

    //update visulization with advancement in time
    await visualizeMusic(undefined, newTime);

    await spotifyApi.seek(newTime);
    res.send({
      sucessful: true
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/seekBack", async (req, res) => {
  //get this from the request
  const timeToSkipBehindBy = 1000;
  try {
    await spotifyApi.refreshAccessToken();
    let progress = undefined;
    let currentPlayingTrack = await spotifyApi.getMyCurrentPlayingTrack();
    progress = {
      time: currentPlayingTrack.body.progress_ms,
      duration: currentPlayingTrack.body.item.duration_ms
    };
    let skip = false;
    let newTime = progress.time - timeToSkipBehindBy;
    await visualizeMusic(undefined, newTime);
    await spotifyApi.seek(newTime);
    res.send({
      sucessful: true
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/pauseTrack", async (req, res) => {
  let activeUser = mapOfActiveUsers.get(req.body.user.socket);
  if (activeUser.connectedDevice.id == undefined) {
    res.send({
      sucessful: false
    });
  }

  try {
    await spotifyApi.refreshAccessToken();
    await spotifyApi.pause();
    await pauseVisualingMusic();

    res.send({
      sucessful: true
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/resumeTrack", async (req, res) => {
  let activeUser = mapOfActiveUsers.get(req.body.user.socket);
  if (activeUser.connectedDevice.id == undefined) {
    res.send({
      sucessful: false
    });
  }
  try {
    await spotifyApi.refreshAccessToken();
    await resumeVisualzingMusic();
    await spotifyApi.play();

    res.send({
      sucessful: true
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/deviceStatus", async (req, res) => {
  try {
    await spotifyApi.refreshAccessToken();
    let result = await spotifyApi.getMyCurrentPlaybackState();
    let songInfoObject = undefined;
    if (result.body.is_playing) {
      let currentPlayingTrack = await spotifyApi.getMyCurrentPlayingTrack();
      songInfoObject = {
        id: currentPlayingTrack.body.item.id,
        name: currentPlayingTrack.body.item.name,
        uri: currentPlayingTrack.body.item.uri
      };

      await spotifyApi.pause();
      
      let visualizationData = await getAudioAnalysis(currentPlayingTrack.body.item.uri);
      await visualizeMusic(visualizationData, currentPlayingTrack.body.progress_ms);

      await spotifyApi.play();
    }
    res.send({
      sucessful: true,
      playback: result.body.is_playing,
      songInfo: songInfoObject
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/selectSong", async (req, res) => {
  let activeUser = mapOfActiveUsers.get(req.body.user.socket);
  if (activeUser.connectedDevice.id == undefined) {
    res.send({
      sucessful: false,
      songInfo: {
        id: undefined,
        name: undefined,
        uri: undefined
      }
    });
  }

  try {
    await spotifyApi.refreshAccessToken();

    let visualizationData = await getAudioAnalysis(req.body.songURI);

    await spotifyApi.play({
      device_id: activeUser.connectedDevice.id,
      uris: [req.body.songURI]
    });

    await visualizeMusic(visualizationData, 0);

    //The getcurrentPlayingTrack is too quick and may get the last playing song. We must wait for the previous request to go through
    await sleep(400);

    let result = await spotifyApi.getMyCurrentPlayingTrack();

    res.send({
      sucessful: true,
      songInfo: {
        id: result.body.item.id,
        name: result.body.item.name,
        uri: result.body.item.uri
      }
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/getPlayLists", async (req, res) => {
  let activeUser = mapOfActiveUsers.get(req.body.user.socket);
  if (activeUser.connectedDevice.id == undefined) {
    res.send({
      sucessful: false,
      playListInfo: undefined
    });
  }

  try {
    await spotifyApi.refreshAccessToken();
    let result = await spotifyApi.getUserPlaylists();
    res.send({
      sucessful: true,
      playListInfo: result.body.items
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.put("/getPlayListsContents", async (req, res) => {
  let activeUser = mapOfActiveUsers.get(req.body.user.socket);
  if (activeUser.connectedDevice.id == undefined) {
    res.send({
      sucessful: false,
      playListInfo: undefined
    });
  }

  try {
    await spotifyApi.refreshAccessToken();
    let result = await spotifyApi.getPlaylistTracks(req.body.playListID);
    res.send({
      sucessful: true,
      playListInfo: result.body.items
    });
  } catch (exception) {
    console.log(exception);
  }
});

app.get("/login", async (req, res) => {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);