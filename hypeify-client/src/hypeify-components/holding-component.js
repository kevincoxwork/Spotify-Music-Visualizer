import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import LandingComponent from "./hypeify-landing";
import PartyComponent from './hypeify-party-component'
import JoinComponent from "./join-component";

const HoldingComponent = () => (
            <Router>
            <div>
                <Switch>
                <Route exact path="/">
                  <LandingComponent />
                </Route>
                <Route exact path="/party">
                  <PartyComponent />
                </Route>
                <Route exact path="/join">
                  <JoinComponent />
                </Route>
              </Switch>
            </div>
          </Router>
)

export default HoldingComponent;