import React from "react";
import io from "socket.io-client";
import { songTrack, activeUser } from "./common-classes";
import PlayPauseIcon from "../pauseplay.png";
import FastForwardIcon from "../fastforwardicon.png";
import BackwardIcon from "../backwardicon.png";
import { Button, Card, CardContent } from "@material-ui/core";
import "./party.css";
import { textAlign } from "@material-ui/system";

const request = require("request");
const queue = require("queue");
const urls = require("./urls");

export default class PartyComponent extends React.PureComponent {
  state = {
    socket: null,
    activeUser: new activeUser(),
    deviceInfo: null,
    queue: new queue(),
    currentPlayingSong: "",
    userPlayLists: null,
    playbackState: false,
    buttonTitle: ""
  };

  async getSpotifyDevices() {
    let responce = await fetch(urls.SPOTDEVINFO, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state.activeUser)
    });

    await this.getDeviceStatus();
    this.setState({ deviceInfo: await responce.json() });
  }

  async getPlayLists() {
    let responce = await fetch(urls.SPOTGETPLAYLISTS, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user: this.state.activeUser })
    });
    let finishedResponce = await responce.json();
    if (finishedResponce.sucessful) {
      this.setState({ userPlayLists: finishedResponce.playListInfo });
    } else {
      this.setState({ userPlayLists: null });
    }
  }

  async getPlaylistTracks(playlistTrackID) {
    //testing id
    playlistTrackID = "7rlkLjjRjeYYsKhH5eXOL9";

    let responce = await fetch(urls.SPOTGETPLAYLISTCONTENTS, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        playListID: playlistTrackID,
        user: this.state.activeUser
      })
    });
    let finishedResponce = await responce.json();
    if (finishedResponce.sucessful) {
      this.setState({ userPlayLists: finishedResponce.playListInfo });
    } else {
      this.setState({ userPlayLists: null });
    }
  }

  async pauseCurrentTrack() {
    let responce = await fetch(urls.SPOTPAUSETRACK, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user: this.state.activeUser })
    });
    let finishedResponce = await responce.json();
    if (finishedResponce.sucessful) {
      this.setState({ playbackState: false, playPauseButtonTitle: "Play" });
    } else {
      this.setState({ userPlayLists: null });
    }
  }
  async resumeCurrentTrack() {
    let responce = await fetch(urls.SPOTRESUMETRACK, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user: this.state.activeUser })
    });
    let finishedResponce = await responce.json();
    if (finishedResponce.sucessful) {
      this.setState({ playbackState: true, playPauseButtonTitle: "Pause" });
    } else {
      this.setState({ userPlayLists: null });
    }
  }

  async skipCurrentTrackRight() {
    await this.skipCurrentTrack(true);
  }

  async skipCurrentTrack(isSkipForward) {
    if (isSkipForward !== true) isSkipForward = false;
    let responce = await fetch(urls.SPOTSKIPTRACK, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        skipToNext: isSkipForward,
        user: this.state.activeUser
      })
    });
    let finishedResponce = await responce.json();
    if (finishedResponce.sucessful) {
      //only edit the queue if we are making a queue, selected song plays the song instantly so don't do this
      await this.getDeviceStatus();
      //edit the queue
      // let tempQueue = this.state.queue;
      // tempQueue.push(songTrack, finishedResponce.songInfo);
      //set state queue -
      this.setState({ currentPlayingSong: finishedResponce.songInfo.name });
    } else {
      this.setState({ currentPlayingSong: `Error: Song Cannot Be Played` });
    }
  }

  async getDeviceStatus() {
    let responce = await fetch(urls.SPOTDEVSTATUS, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user: this.state.activeUser })
    });
    let finishedResponce = await responce.json();
    if (finishedResponce.sucessful) {
      let buttonTitle = "Play";
      if (finishedResponce.playback) buttonTitle = "Pause";
      this.setState({
        playbackState: finishedResponce.playback,
        playPauseButtonTitle: buttonTitle
      });
    } else {
      this.setState({ currentPlayingSong: `Error: Song Cannot Be Played` });
    }
  }

  async selectSong() {
    //We should have this var as a parameter where we pass the id
    let tempSong = `spotify:track:4DTpngLjoHj5gFxEZFeD3J`;

    let responce = await fetch(urls.SPOTSELECTSONG, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ songURI: tempSong, user: this.state.activeUser })
    });
    let finishedResponce = await responce.json();
    if (finishedResponce.sucessful) {
      //only edit the queue if we are making a queue, selected song plays the song instantly so don't do this

      //edit the queue
      // let tempQueue = this.state.queue;
      // tempQueue.push(songTrack, finishedResponce.songInfo);
      //set state queue -
      this.setState({ currentPlayingSong: finishedResponce.songInfo.name });
    } else {
      this.setState({ currentPlayingSong: `Error: Song Cannot Be Played` });
    }
  }

  async pausePlayCurrentTrack() {
    if (this.state.playbackState) await this.pauseCurrentTrack();
    else await this.resumeCurrentTrack();
  }

  componentDidMount = () => {
    // connect to server
    const socket = io.connect("http://localhost:2500");

    socket.on("connectedSuccessfully", this.connectedSuccessfully);

    this.setState({ socket: socket });
  };

  connectedSuccessfully = dataFromServer => {
    this.setState({ activeUser: dataFromServer });
  };

  render() {
    return (
      <div className="background">
        <div>
          <div className="headerDiv">
            <p className="headerText">
              Your Room Name Is: {this.state.activeUser.room}
            </p>
            <p>
              Logged in: Your receivedAccessToken Is{" "}
              {this.state.activeUser.access_token}
            </p>
          </div>
          <Card style={{ width: "80%" }}>
            <CardContent
              style={{ textAlign: "center", backgroundColor: "Black" }}
            >
              {this.state.deviceInfo != undefined && (
                <div>
                  <p className="buttonText">
                    Device Name: {this.state.deviceInfo[0].name}
                  </p>
                  <p className="buttonText">
                    Device Type: {this.state.deviceInfo[0].type}
                  </p>
                  <p className="buttonText">
                    Current Volume: {this.state.deviceInfo[0].volume_percent}
                  </p>
                  <p className="buttonText">
                    Current Song is: {this.state.currentPlayingSong}
                  </p>
                  <p className="buttonText">
                    Is Song Playing is:{" "}
                    {JSON.stringify(this.state.playbackState)}
                  </p>
                  <p className="buttonText">
                    User PlayList Data is:{" "}
                    {JSON.stringify(this.state.userPlayLists)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="sideButtons">
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={this.getSpotifyDevices.bind(this)}
              >
                <span className="buttonText">Click To Get Devices</span>
              </Button>
            </div>
            <br />
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={this.selectSong.bind(this)}
              >
                <span className="buttonText">Click To Play Selected Song</span>
              </Button>
            </div>
            <br />
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={this.getPlayLists.bind(this)}
              >
                <span className="buttonText">
                  {" "}
                  Click To Get All User Playlists
                </span>
              </Button>
            </div>
            <br />
            <div>
              <Button
                variant="contained"
                color="primary"
                className="buttonOption4"
                onClick={this.getPlaylistTracks.bind(this)}
              >
                <span className="buttonText">
                  Click To Get All Tracks From The PlayList
                </span>
              </Button>
            </div>
          </div>

          <br />
          <div className="footer">
            <Button
              variant="contained"
              color="primary"
              className="buttonPadding"
              onClick={this.skipCurrentTrack.bind(this)}
            >
              <img src={BackwardIcon} width="100" height="75"></img>
            </Button>
            <Button
              variant="contained"
              color="primary"
              className="buttonPadding"
              onClick={this.pausePlayCurrentTrack.bind(this)}
            >
              <img width="100" height="75" src={PlayPauseIcon}></img>
            </Button>
            <Button
              variant="contained"
              color="primary"
              className="buttonPadding"
              onClick={this.skipCurrentTrackRight.bind(this)}
            >
              <img src={FastForwardIcon} width="100" height="75"></img>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
