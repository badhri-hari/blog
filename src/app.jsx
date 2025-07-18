import { render } from "preact";
import { Router } from "preact-router";

import Header from "./components/header/header";
import Aside from "./components/aside/aside";

import Home from "./pages/home/home";
import About from "./pages/about/about";
import Links from "./pages/links/links";
import Media from "./pages/media/media";

import "./app.css";
import "./app-mobile.css";

function App() {
  return (
    <>
      <Header />
      <div className="main-area">
        <Aside />
        <Router>
          <Home default />
          <About path="/about_construction" />
          <Links path="/links_construction" />
          <Media path="/media_construction" />
        </Router>
      </div>
    </>
  );
}

render(<App />, document.getElementById("root"));
