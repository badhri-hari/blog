import "./header.css";
import "./header-mobile.css";

export default function Header() {
  return (
    <header className="header" aria-hidden>
      <a href="/" className="logo-link">
        <h1 className="horizontal-text">
          <span className="letter-b">b</span>adhri's{" "}
          <span className="vertical-text">log</span>
        </h1>
      </a>
    </header>
  );
}
