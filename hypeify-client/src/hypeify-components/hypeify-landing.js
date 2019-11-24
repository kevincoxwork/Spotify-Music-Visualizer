import React from "react";
import { Spring, useSpring, animated } from "react-spring";
import { Button, Fade } from "@material-ui/core";
import { Redirect, Router } from "react-router-dom";
import landingVideo from "../media/stock-footage-landing.mp4";
import Cover from "react-video-cover";
import "./landing.css";
import { fontSize } from "@material-ui/system";

const urls = require("./urls");

export default class LandingComponent extends React.PureComponent {
  state = {
    gologin: false
  };
  handlelogin = () => {
    this.setState({ gologin: true });
  };

  render() {
    if (this.state.gologin === true) {
      window.location.href = urls.LOGIN;
    }
    return (
      <body className="landingHolder">
        <div className="video">
          <Cover
            videoOptions={{
              src: landingVideo,
              autoPlay: true,
              muted: true,
              loop: true
            }}
          />
          <Fade in={true} timeout={3000}>
            <div className="landing">
              <h1>Welcome to Hypeify</h1>
              <br />
              <Button
                onClick={this.handlelogin}
                variant="contained"
                color="primary"
              >
                <span className="buttonText" style={{ color: "white" }}>
                  Log In!
                </span>
              </Button>
            </div>
          </Fade>
        </div>
      </body>
    );
  }
}
