import React from "react";
import { Spring, useSpring, animated } from "react-spring";
//import HypeifyWordComponent from "../hypeify-components/hypeifywordcomponent.js";
import "./landing.css";
import VisualizationComponent from "./hypeify-software-visualization-demo";
import { Button } from "@material-ui/core";
import { Redirect, Router } from "react-router-dom";
import landingVideo from '../media/stock-footage-landing.mp4'
import Cover from 'react-video-cover';

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
                src: landingVideo, autoPlay: true, muted: true,
                loop: true
              }}
            />
        <div className="landing">
         
          
            <h1>Welcome to Hypeify</h1>
            <br />
            <Button
              onClick={this.handlelogin}
              variant="contained"
              color="primary"
            >
              Log In!
            </Button>
          
          </div>
        </div>
        </body>
      );
    }
  }
