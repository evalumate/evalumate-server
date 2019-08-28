import React from "react";
import ReactDOM from "react-dom";
import App from "./lib/App";

ReactDOM.render(<App />, document.getElementById("app"));

// Hot Module Replacement
if (typeof (module as any).hot !== "undefined") {
  (module as any).hot.accept();
}
