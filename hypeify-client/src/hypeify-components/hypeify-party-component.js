import React from "react";
import io from "socket.io-client";
import { songTrack, activeUser } from "./common-classes";
import PlayIcon from "../pause.png";
import PauseIcon from "../play.png";
import FastForwardIcon from "../fastforwardicon.png";
import BackwardIcon from "../backwardicon.png";
import {
  Button,
  Card,
  CardContent,
  AppBar,
  Typography,
  IconButton,
  Toolbar,
  MenuItem,
  Menu,
  Slider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Paper
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Moment from "react-moment";
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
  getPlaylistTracks,
  seekTrack,
  followTrack
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
    userPlayLists: new Array(),
    playbackState: false,
    buttonTitle: "",
    anchorEl: null,
    currentPos: 0,
    trackLength: 0,
    songPlaying: false,
    albumArtInfo: { url: "", height: "", width: "" },
    popUpModel: false,
    chooseSong: false,
    songOrList: false,
    menuOpen: false,
    artText: "PlayList Art",
    albumText: "PlayList Name"
  };

  async getPlayListsTracksClicked(playlistTrackID) {
    if (this.state.chooseSong == false) {
      let result = await getPlaylistTracks(
        playlistTrackID,
        this.state.activeUser
      );
      this.setState({
        chooseSong: true,
        artText: "Song Art",
        albumText: "Song Name"
      });
      this.setState(result);
    } else {
      let result = await selectSong(playlistTrackID, this.state.deviceInfo);
    }
  }

  async getPlayListsClicked() {
    this.setState({ menuOpen: false });
    let result = await getPlayLists();
    this.setState({ userPlayLists: result.userPlayLists, popUpModel: true });
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

  async seek(newTime) {
    await seekTrack(newTime);
  }

  async follow() {
    let results = await followTrack();
    this.setState({
      currentPos: results.progress.time,
      trackLength: results.progress.duration,
      albumArtInfo: results.progress.art
    });
  }

  async pausePlayCurrentTrackClicked() {
    let result = null;
    if (this.state.playbackState) {
      await pauseCurrentTrack(this.state.activeUser);
      this.setState({ songPlaying: false });
    } else {
      await resumeCurrentTrack(this.state.activeUser);
      this.setState({ songPlaying: true });
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
    this.interval = setInterval(() => this.follow(), 1000);
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  socketDisconnect = dataFromServer => {};

  connectedSuccessfully = dataFromServer => {
    this.setState({ activeUser: dataFromServer });
  };

  deviceSelected = passedDeviceInfo => {
    this.deviceStatusClicked();
    this.setState({ deviceInfo: passedDeviceInfo });
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
    this.setState({ menuOpen: true });
  };

  handleSeek = (event, newValue) => {
    this.seek(newValue);
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
    this.setState({ menuOpen: false });
  };

  handleClose = () => {
    this.setState({ open: false });
    this.setState({ popUpModel: false, chooseSong: false });
  };

  handlePlayListClicked = id => {
    this.setState({ songOrList: true });
    this.getPlayListsTracksClicked(id);
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: false });
  };

  render() {
    const {
      anchorEl,
      setAnchorEl,
      currentPos,
      trackLength,
      popUpModel,
      userPlayLists,
      menuOpen,
      artText,
      albumText
    } = this.state;
    const open = Boolean(anchorEl);
    return (
      <div className="background">
        <Dialog
          open={popUpModel}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {" "}
            Choose A Song From Playlist
          </DialogTitle>
          <DialogContent>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{albumText}</TableCell>
                    <TableCell align="right">{artText}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userPlayLists.map(userPlayList => (
                    <TableRow
                      key={userPlayList.id}
                      onClick={this.handlePlayListClicked.bind(
                        this,
                        userPlayList.id
                      )}
                    >
                      <TableCell component="th" scope="row">
                        {userPlayList.name}
                      </TableCell>
                      <TableCell align="right">
                        <img
                          src={userPlayList.image}
                          height="50"
                          width="50"
                        ></img>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className="menuButton"
              color="inherit"
              aria-label="menu"
              open={menuOpen}
              onClick={this.handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className="title">
              Menu
            </Typography>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              open={menuOpen}
              onClose={this.handleClose}
            >
              <MenuItem onClick={this.getPlayListsClicked.bind(this)}>
                <span className="buttonText">Choose A Song From Playlist</span>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <div className="centerWithLine">
          {this.state.deviceInfo === null && (
            <PromptDeviceComponent
              active_user={this.state.activeUser}
              callbackToParent={this.deviceSelected}
            ></PromptDeviceComponent>
          )}
          <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justify="center"
          >
            <Grid item xs={0} style={{ width: "80%" }}>
              <Card style={{ width: "80%" }} className="center">
                <CardContent
                  style={{
                    textAlign: "center"
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
                      <img
                        className="albumArtImage"
                        src={this.state.albumArtInfo.url}
                        height={this.state.albumArtInfo.height / 2}
                        width={this.state.albumArtInfo.width / 2}
                      ></img>
                      <p className="buttonText">
                        {this.state.currentPlayingSong}
                      </p>
                    </div>
                  )}

                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    alignItems="center"
                    justify="center"
                    className="center"
                    style={{ margin: "auto" }}
                  >
                    <Grid item xs={0}>
                      <Moment format="m [:] ss" date={currentPos}></Moment>
                    </Grid>
                    <Grid item xs={5} style={{ width: "100%" }}>
                      <Slider
                        className="sliderStyle"
                        onChangeCommitted={this.handleSeek}
                        min={0}
                        max={trackLength}
                        value={currentPos}
                        aria-labelledby="continuous-slider"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Moment format="m [:] ss" date={trackLength}></Moment>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={3}
                    direction="row"
                    alignItems="center"
                    justify="center"
                    className="center"
                  >
                    <Grid item xs={3}>
                      <div className="spaceButton">
                        <Button
                          variant="contained"
                          color="primary"
                          className="playerButtons"
                          onClick={this.skipCurrentTrackLeftClicked.bind(this)}
                        >
                          <img
                            className="imageResponse"
                            src={BackwardIcon}
                          ></img>
                        </Button>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <div className="spaceButton">
                        <Button
                          variant="contained"
                          color="primary"
                          className="playerButtons"
                          onClick={this.pausePlayCurrentTrackClicked.bind(this)}
                        >
                          {" "}
                          {!this.state.playbackState && (
                            <img
                              className="imageResponse"
                              src={PauseIcon}
                            ></img>
                          )}
                          {this.state.playbackState && (
                            <img className="imageResponse" src={PlayIcon}></img>
                          )}
                        </Button>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <div className="spaceButton">
                        <Button
                          variant="contained"
                          color="primary"
                          className="playerButtons"
                          onClick={this.skipCurrentTrackRightClicked.bind(this)}
                        >
                          <img
                            className="imageResponse"
                            src={FastForwardIcon}
                          ></img>
                        </Button>
                      </div>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}
