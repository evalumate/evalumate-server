import Menu from "../Menu/Menu";
import AboutPage from "../pages/AboutPage/AboutPage";
import ClientPage from "../pages/ClientPage/ClientPage";
import HomePage from "../pages/HomePage/HomePage";
import MasterPage from "../pages/MasterPage/MasterPage";
import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/client" component={ClientPage} />
        <Route path="/client/:sessionId" component={ClientPage} />
        <Route path="/master" component={MasterPage} />
        <Route path="/master/:sessionId" component={MasterPage} />
      </Switch>
    </BrowserRouter>
  );
}
