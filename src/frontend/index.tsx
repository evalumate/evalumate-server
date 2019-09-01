import "./lib/main.scss";

import React from "react";
import ReactDOM from "react-dom";
import App from "./lib/components/App/App";

// Hot Module Replacement
if (typeof (module as any).hot !== "undefined") {
  (module as any).hot.accept();
}

ReactDOM.render(<App />, document.getElementById("app"));
