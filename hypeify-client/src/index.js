import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import HoldingComponent from "./hypeify-components/holding-component";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<HoldingComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
