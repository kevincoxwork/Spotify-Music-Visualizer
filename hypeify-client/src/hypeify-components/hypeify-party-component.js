import React from "react";
import io from "socket.io-client";
import { songTrack, activeUser } from "./common-classes";
import PlayPauseIcon from "../pauseplay.png";
import FastForwardIcon from "../fastforwardicon.png";
import BackwardIcon from "../backwardicon.png";
import { Button, Card, CardContent } from "@material-ui/core";
import "./party.css";
import { textAlign } from "@material-ui/system";
import PromptDeviceComponent from "./prompt-device-component";
import {
  getPlayLists,
  pauseCurrentTrack,
  resumeCurrentTrack,
  selectSong,
  getDeviceStatus,
  skipCurrentTrack,
  getPlayListsTracks,
  seekBack,
  seekForward
} from "./common-endpoint-methods.js";

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

  async getPlayListsTracksClicked(playlistTrackID) {
    playlistTrackID = "6euMPZz8wRBQBf9U2W91Xw";
    let result = await getPlayListsTracks(
      playlistTrackID,
      this.state.activeUser
    );
    this.setState(result);
  }

  async getPlayListsClicked() {
    let result = await getPlayLists();
    this.setState({ userPlayLists: result });
  }

  async skipCurrentTrackLeftClicked() {
    let result = await skipCurrentTrack(false, this.state.activeUser);
    let status = await getDeviceStatus(this.state.activeUser);
    this.setState(status);
  }

  async skipCurrentTrackRightClicked() {
    let result = await skipCurrentTrack(true, this.state.activeUser);
    let status = await getDeviceStatus(this.state.activeUser);
    this.setState(status);
  }

  async deviceStatusClicked() {
    let result = await getDeviceStatus(this.state.activeUser);
    this.setState(result);
  }

  async seekTrackForward() {
    await seekForward();
  }

  async seekTrackBack() {
    await seekBack();
  }

  async pausePlayCurrentTrackClicked() {
    let result = null;
    if (this.state.playbackState) {
      await pauseCurrentTrack(this.state.activeUser);
    } else {
      await resumeCurrentTrack(this.state.activeUser);
    }
    result = await getDeviceStatus(this.state.activeUser);
    this.setState(result);
  }

  async selectSongClicked() {
    let songID = `spotify:track:5tf1VVWniHgryyumXyJM7w`;

    let result = await selectSong(songID, this.state.activeUser);
    this.setState(result);
  }

  componentDidMount = () => {
    // connect to server
    const socket = io.connect(urls.SERVER);

    socket.on("connectedSuccessfully", this.connectedSuccessfully);
    socket.on("disconnect", this.socketDisconnect);

    this.setState({ socket: socket });
  };

  socketDisconnect = dataFromServer => {};

  connectedSuccessfully = dataFromServer => {
    this.setState({ activeUser: dataFromServer });
  };

  deviceSelected = passedDeviceInfo => {
    this.deviceStatusClicked();
    this.setState({ deviceInfo: passedDeviceInfo });
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
          {this.state.deviceInfo === null && (
            <PromptDeviceComponent
              active_user={this.state.activeUser}
              callbackToParent={this.deviceSelected}
            ></PromptDeviceComponent>
          )}
          <Card style={{ width: "80%", backgroundColor: "Black" }}>
            <CardContent
              style={{
                textAlign: "center",
                backgroundColor: "Black"
              }}
            >
              {this.state.deviceInfo != undefined && (
                <div>
                  <p className="buttonText">
                    Device Name: {this.state.deviceInfo.name}
                  </p>
                  <p className="buttonText">
                    Device Type: {this.state.deviceInfo.type}
                  </p>
                  <p className="buttonText">
                    Current Volume: {this.state.deviceInfo.volume_percent}
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
                //onClick={this.getSpotifyDevices.bind(this)}
              >
                <span className="buttonText">Click To Get Devices</span>
              </Button>
            </div>
            <br />
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={this.selectSongClicked.bind(this)}
              >
                <span className="buttonText">Click To Play Selected Song</span>
              </Button>
            </div>
            <br />
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={this.getPlayListsClicked.bind(this)}
              >
                <span className="buttonText">
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
                onClick={this.getPlayListsTracksClicked.bind(this)}
              >
                <span className="buttonText">
                  Click To Get All Tracks From The PlayList
                </span>
              </Button>
            </div>
          </div>
          <br />
          <br />
          <div className="seekButtons">
            <Button
              variant="contained"
              color="primary"
              onClick={this.seekTrackBack.bind(this)}
            >
              <span className="buttonText">Seek Back</span>
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.seekTrackForward.bind(this)}
            >
              <span className="buttonText">Seek Forward</span>
            </Button>
          </div>
          <div className="footer">
            <div className="leftButton">
              <Button
                variant="contained"
                color="primary"
                className="playerButtons"
                onClick={this.skipCurrentTrackLeftClicked.bind(this)}
              >
                <img className="imageResponse" src={BackwardIcon}></img>
              </Button>
            </div>
            <div className="centerButton">
              <Button
                variant="contained"
                color="primary"
                className="playerButtons"
                onClick={this.pausePlayCurrentTrackClicked.bind(this)}
              >
                <img className="imageResponse" src={PlayPauseIcon}></img>
              </Button>
            </div>
            <div style={{ paddingLeft: 1000 }}>
              <Button
                variant="contained"
                color="primary"
                className="playerButtons"
                onClick={this.skipCurrentTrackRightClicked.bind(this)}
              >
                <img className="imageResponse" src={FastForwardIcon}></img>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
