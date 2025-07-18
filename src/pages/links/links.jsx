import "./links.css";
import "./links-mobile.css";

export default function Links() {
  return (
    <main className="random-links">
      <h1>Random Links</h1>

      <div className="links">
        <h2>
          <a href="" target="_blank">
            LINK 1
          </a>
        </h2>
        <p>LINK 1 DESCRIPTION</p>
      </div>

      <div className="links">
        <h2>
          <a href="" target="_blank">
            LINK 2
          </a>
        </h2>
        <p>LINK 2 DESCRIPTION</p>
      </div>

      <div className="links">
        <h2>
          <a href="" target="_blank">
            LINK 3
          </a>
        </h2>
        <p>LINK 3 DESCRIPTION</p>
      </div>
    </main>
  );
}
