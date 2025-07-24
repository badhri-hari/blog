import { render } from "preact";
import { Router } from "preact-router";

import Header from "./components/header/header";
import Aside from "./components/aside/aside";

import Home from "./pages/home/home";
import About from "./pages/about/about";
import Links from "./pages/links/links";
import Archive from "./pages/archive/archive";

import "./app.css";

function App() {
  return (
    <>
      <Header />
      <div className="main-area">
        <Aside />
        <Router>
          <Home default />
          <About path="/about" />
          <Links path="/links" />
          <Archive path="/archive" />
        </Router>
      </div>
    </>
  );
}

render(<App />, document.getElementById("root"));
