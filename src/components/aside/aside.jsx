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
          aria-label="Go to the Blogs page"
        >
          By BADHRI HARI
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
          href="/guestbook"
          className="aside-links"
          aria-label="Go to the guest book page to add a public comment to my site!"
        >
          Guestbook
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
