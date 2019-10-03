import "./lib/main.scss";

import React from "react";
import ReactDOM from "react-dom";
import App from "./lib/components/App/App";
import { getConfig } from "./lib/util/api";
import config from "react-global-configuration";

// Hot Module Replacement
if (typeof (module as any).hot !== "undefined") {
  (module as any).hot.accept();
}

getConfig()
  .then(config.set)
  .then(() => {
    ReactDOM.render(<App />, document.getElementById("app"));
  });
