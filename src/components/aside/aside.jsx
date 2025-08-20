import { Link } from "preact-router/match";

import "./aside.css";
import "./aside-mobile.css";

export default function Aside() {
  return (
    <aside>
      <h1>
        <Link
          href="/"
          className="aside-links"
          title="See latest posts"
          aria-label="Go to the Home page to see my blog posts"
        >
          <span className="full-name">By BADHRI HARI</span>
          <span className="short-name">By B.H.</span>
        </Link>
      </h1>
      <h2>
        <Link
          href="/about"
          className="aside-links"
          aria-label="Go to the About page"
        >
          About
        </Link>
      </h2>
      <h2>
        <Link
          href="/links"
          className="aside-links"
          aria-label="Go to the Random Links page"
        >
          Random Links
        </Link>
      </h2>
      <h2>
        <Link
          href="/chat"
          className="aside-links"
          aria-label="Go to the live chat page to chat with others on my site!"
        >
          Live Chat
        </Link>
      </h2>
      <h2>
        <Link
          href="/search"
          className="aside-links"
          aria-label="Go to the Search page"
          style={{
            pointerEvents: "none",
            opacity: "0.6",
          }}
        >
          Search
        </Link>
      </h2>
    </aside>
  );
}
