import { useState } from "preact/hooks";

import { FaLinkedin } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";
import { FaRedditAlien, FaRss, FaCheck } from "react-icons/fa";

import "./about.css";
import "./about-mobile.css";

export default function About() {
  const [copied, setCopied] = useState(false);

  const handleCopyRss = async () => {
    try {
      await navigator.clipboard.writeText("https://badhri.vercel.app/api/rss");
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy RSS URL:", err);
    }
  };

  return (
    <main className="about-me">
      <h1>About</h1>

      <div className="bio">
        <p>Hi, I'm Badhri.</p>
      </div>

      <div className="socials">
        <a
          href="https://linkedin.com/in/badhri-hari"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin"
          title="LinkedIn"
          aria-label="Visit my LinkedIn profile"
        >
          <FaLinkedin className="socials-icons" />
        </a>

        <a
          href="https://github.com/badhri-hari"
          target="_blank"
          rel="noopener noreferrer"
          className="github"
          title="GitHub"
          aria-label="Visit my GitHub profile"
        >
          <IoLogoGithub className="socials-icons" />
        </a>

        <a
          href="https://reddit.com/u/rise_sol"
          target="_blank"
          rel="noopener noreferrer"
          className="reddit"
          title="Reddit"
          aria-label="Visit my Reddit profile"
        >
          <FaRedditAlien className="socials-icons" />
        </a>

        <button
          onClick={handleCopyRss}
          className="rss-button"
          aria-label="Click on this to copy the RSS feed link for my website to add it to your RSS reader."
        >
          <span className="asterisk-wrapper">
            {copied ? (
              <FaCheck color="white" className="socials-icon" size={30} />
            ) : (
              <FaRss color="white" className="socials-icon" size={30} />
            )}
            {!copied && (
              <span className="asterisk-popup">Copy link for RSS feed</span>
            )}
          </span>
        </button>
      </div>
    </main>
  );
}
