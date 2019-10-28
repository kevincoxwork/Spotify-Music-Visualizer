import React from "react";
import "./landing.css";
import { songTrack, activeUser } from "./common-classes";
import { getSpotifyDevices } from "./common-endpoint-methods";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Grid,
  Icon
} from "@material-ui/core";
import ComputerIcon from "@material-ui/icons/Computer";
import PhoneAndroidIcon from "@material-ui/icons/PhoneAndroid";
import "../hypeify-components/party.css";
const urls = require("./urls");

export default class PromptDeviceComponent extends React.PureComponent {
  state = {
    deviceInfo: undefined,
    activeUser: new activeUser(),
    dialogOpen: false
  };

  async componentWillReceiveProps(props) {
    let result = await getSpotifyDevices(props.active_user);
    this.setState({ deviceInfo: result, dialogOpen: true });
  }

  handleClickOpen = () => {
    this.setState({ dialogOpen: true });
  };

  handleClose = () => {
    this.setState({ dialogOpen: false });
  };

  selectDevice = index => {
    this.props.callbackToParent(this.state.deviceInfo.deviceInfo[index]);
    this.setState({ dialogOpen: false });
  };

  generateDeviceList() {
    let list = [];

    if (this.state.deviceInfo !== undefined) {
      for (let i = 0; i < this.state.deviceInfo.deviceInfo.length; i++) {
        let selectedDeviceIcon;

        if (this.state.deviceInfo.deviceInfo[i].type === "Computer") {
          selectedDeviceIcon = <ComputerIcon size={50}></ComputerIcon>;
        } else if (this.state.deviceInfo.deviceInfo[i].type === "Tablet") {
          selectedDeviceIcon = <PhoneAndroidIcon size={50}></PhoneAndroidIcon>;
        }

        list.push(
          <div key={i}>
            <Grid item xs={12}>
              <Paper style={{ textAlign: "center" }}>
                <DialogContentText>
                  {this.state.deviceInfo.deviceInfo[i].name}{" "}
                </DialogContentText>
                <Button
                  onClick={() => {
                    this.selectDevice(i);
                  }}
                >
                  {selectedDeviceIcon}
                </Button>
                <DialogContentText>
                  {this.state.deviceInfo.deviceInfo[i].type}{" "}
                </DialogContentText>
              </Paper>
            </Grid>
          </div>
        );
      }
    }

    return list;
  }

  render() {
    return (
      <Dialog
        className="responsePromptPhone"
        open={this.state.dialogOpen}
        onClose={this.handleClose}
      >
        <DialogTitle>{"Select An Active Spotify Device"}</DialogTitle>
        <DialogContent>
          <Grid
            container
            justify="center"
            alignItems="center"
            direction="column"
          >
            {this.generateDeviceList()}
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}
