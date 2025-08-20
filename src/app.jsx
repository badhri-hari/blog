import { render } from "preact";
import { Router } from "preact-router";

import Header from "./components/header/header";
import Aside from "./components/aside/aside";

import Home from "./pages/home/home";
import Post from "./pages/post/post";
import Comments from "./pages/comments/comments";
import About from "./pages/about/about";
import Links from "./pages/links/links";
import Guestbook from "./pages/guestbook/guestbook";
import Search from "./pages/search/search";
import Buttons from "./components/buttons/buttons";

import "./app.css";

const spacing = "0.5rem";
const style = `
  padding: ${spacing};
  background-color: black;
  color: white;
  font-weight: Bold;
  border: ${spacing} solid #ff4f00;
  border-radius: ${spacing};
  font-size: 2em;
  flex: 1;
`;
console.log("%c hi there :)", style);

const style2 = `
  padding: ${spacing};
  background-color: black;
  color: white;
  font-weight: Bold;
  border: ${spacing} solid #5865F2 ;
  border-radius: ${spacing};
  font-size: 2em;
  flex: 1;
`;
console.log("%c discord: @baddhri", style2);

function App() {
  function handleRoute(e) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({
        path: e.url,
      });
    }
  }

  return (
    <>
      <Header />
      <div className="main-area">
        <Aside />
        <Router onChange={handleRoute}>
          <Home default />
          <Post path="/post" />
          <Comments path="/comments" />
          <About path="/about" />
          <Links path="/links" />
          <Guestbook path="/guestbook" />
          <Search path="/search" />
        </Router>
      </div>

      <Buttons />
    </>
  );
}

render(<App />, document.getElementById("root"));
