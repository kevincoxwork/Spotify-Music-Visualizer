import React from "react";
import { Spring, useSpring, animated } from "react-spring";
//import HypeifyWordComponent from "../hypeify-components/hypeifywordcomponent.js";
import "./landing.css";
import VisualizationComponent from "./hypeify-software-visualization-demo";
import { Button } from "@material-ui/core";
import { Redirect, Router } from "react-router-dom";

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
    if (window.location.href.indexOf("token") > -1) {
      return <VisualizationComponent />;
    } else {
      return (
        <header className="App-header">
          <div>
            <br />
            <h1>Welcome to Hypeify</h1>
          </div>
          <div>
            <Button
              onClick={this.handlelogin}
              variant="contained"
              color="primary"
            >
              Log In!
            </Button>
          </div>
        </header>
      );
    }
  }
}
