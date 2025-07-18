import "./aside.css";
import "./aside-mobile.css";

export default function Aside() {
  return (
    <aside>
      <h1>
        <a
          href="/about"
          className="aside-links"
          aria-label="Go to the About page"
          title="Open About page"
          style={{ cursor: "not-allowed", pointerEvents: "none" }}
        >
          By BADHRI HARI
        </a>
      </h1>
      <h2>
        <a
          href="/"
          className="aside-links"
          aria-label="Go to the Home page"
          title="Open home page"
          style={{ cursor: "not-allowed", pointerEvents: "none" }}
        >
          Home Page
        </a>
      </h2>
      <h2>
        <a
          href="/links"
          className="aside-links"
          aria-label="Go to the Random Links page"
          title="Open Random Links page"
          style={{ cursor: "not-allowed", pointerEvents: "none" }}
        >
          Random Links
        </a>
      </h2>
      <h2>
        <a
          href="/media"
          className="aside-links"
          aria-label="Go to the Media Archive page"
          title="Open Media Archive page"
          style={{ cursor: "not-allowed", pointerEvents: "none" }}
        >
          Media Archive
        </a>
      </h2>
    </aside>
  );
}
