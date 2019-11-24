const urls = require("./urls");

module.exports.getSpotifyDevices = async function getSpotifyDevices(
  activeUser
) {
  if (activeUser.access_token !== undefined) {
    let responce = await fetch(urls.SPOTDEVINFO, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(activeUser)
    });
    return {
      deviceInfo: await responce.json()
    };
  }
};

module.exports.getPlayLists = async function getPlayLists(activeUser) {
  let responce = await fetch(urls.SPOTGETPLAYLISTS, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: activeUser
    })
  });
  let finishedResponce = await responce.json();
  if (finishedResponce.sucessful) {
    return {
      userPlayLists: finishedResponce.playListInfo
    };
  } else {
    return {
      userPlayLists: null
    };
  }
};

module.exports.seekTrack = async function seekTrack(newTime) {
  let reponse = await fetch(urls.SPOTSEEK, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ seekTime: newTime })
  });
  let finishedResponse = await reponse.json();
};

module.exports.followTrack = async function followTrack() {
  let response = await fetch(urls.SPOTFOLLOWTRACK, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  let finishedResponse = await response.json();
  return finishedResponse;
};

module.exports.pauseCurrentTrack = async function pauseCurrentTrack(
  activeUser
) {
  let responce = await fetch(urls.SPOTPAUSETRACK, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: activeUser
    })
  });
  let finishedResponce = await responce.json();
  if (finishedResponce.sucessful) {
    return {
      playbackState: false,
      playPauseButtonTitle: "Play"
    };
  } else {
    return {
      userPlayLists: null
    };
  }
};

module.exports.resumeCurrentTrack = async function resumeCurrentTrack(
  activeUser
) {
  let responce = await fetch(urls.SPOTRESUMETRACK, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: activeUser
    })
  });
  let finishedResponce = await responce.json();
  if (finishedResponce.sucessful) {
    return {
      playbackState: true,
      playPauseButtonTitle: "Pause"
    };
  } else {
    return {
      userPlayLists: null
    };
  }
};

module.exports.selectSong = async function selectSong(songID, deviceInfo) {
 
  let responce = await fetch(urls.SPOTSELECTSONG, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      songURI: songID,
      device_info: deviceInfo
    })
  });
  let finishedResponce = await responce.json();
  if (finishedResponce.sucessful) {
    //only edit the queue if we are making a queue, selected song plays the song instantly so don't do this

    //edit the queue
    // let tempQueue = this.state.queue;
    // tempQueue.push(songTrack, finishedResponce.songInfo);
    //set state queue -
    return {
      currentPlayingSong: finishedResponce.songInfo.name
    };
  } else {
    return {
      currentPlayingSong: `Error: Song Cannot Be Played`
    };
  }
};

module.exports.getDeviceStatus = async function getDeviceStatus(activeUser) {
  let responce = await fetch(urls.SPOTDEVSTATUS, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(activeUser)
  });
  let finishedResponce = await responce.json();

  if (finishedResponce.sucessful) {
    let buttonTitle = "Play";
    let currentTitle = "No Song Is Currently Being Played";
    if (finishedResponce.playback) {
      buttonTitle = "Pause";
      currentTitle = finishedResponce.songInfo.name;
    }
    return {
      playbackState: finishedResponce.playback,
      playPauseButtonTitle: buttonTitle,
      currentPlayingSong: currentTitle
    };
  } else {
    return {
      currentPlayingSong: `Error: Song Cannot Be Played`
    };
  }
};

module.exports.skipCurrentTrack = async function skipCurrentTrack(
  isSkipForward,
  activeUser
) {
  let responce = await fetch(urls.SPOTSKIPTRACK, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      skipToNext: isSkipForward,
      user: activeUser
    })
  });
  let finishedResponce = await responce.json();
  if (finishedResponce.sucessful) {
    //only edit the queue if we are making a queue, selected song plays the song instantly so don't do this

    //edit the queue
    // let tempQueue = this.state.queue;
    // tempQueue.push(songTrack, finishedResponce.songInfo);
    //set state queue -
    return {
      currentPlayingSong: finishedResponce.songInfo.name
    };
  } else {
    return {
      currentPlayingSong: `Error: Song Cannot Be Played`
    };
  }
};

module.exports.getPlaylistTracks = async function getPlaylistTracks(
  playlistTrackID,
  activeUser
) {
  let responce = await fetch(urls.SPOTGETPLAYLISTCONTENTS, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      playListID: playlistTrackID,
      user: activeUser
    })
  });
  let finishedResponce = await responce.json();
  if (finishedResponce.sucessful) {
    return {
      userPlayLists: finishedResponce.playListInfo
    };
  } else {
    return {
      userPlayLists: null
    };
  }
};
