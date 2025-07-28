import "./aside.css";
import "./aside-mobile.css";

export default function Aside() {
  return (
    <aside>
      <h1>
        <a
          href="/"
          className="aside-links"
          title="See latest posts"
          aria-label="Go to the Blogs page"
        >
          By BADHRI HARI
        </a>
      </h1>
      <h2>
        <a
          href="/about"
          className="aside-links"
          aria-label="Go to the About page"
        >
          About
        </a>
      </h2>
      <h2>
        <a
          href="/links"
          className="aside-links"
          aria-label="Go to the Random Links page"
        >
          Random Links
        </a>
      </h2>
      <h2>
        <a
          href="/archive"
          className="aside-links"
          aria-label="Go to the Search/Archive page"
          style={{
            pointerEvents: "none",
            opacity: "0.6",
          }}
        >
          Archive
        </a>
      </h2>
    </aside>
  );
}
