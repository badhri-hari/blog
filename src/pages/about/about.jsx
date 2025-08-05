import { useState } from "preact/hooks";

import { FaLinkedin } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";
import { FaRedditAlien, FaRss, FaCheck } from "react-icons/fa";

import "./about.css";
import "./about-mobile.css";

export default function About() {
  return (
    <main className="about-me">
      <h1>About</h1>

      <div className="bio">
        <p>
          Don't take my musings too seriously.
        </p>
      </div>

      <div className="socials">
        <a
          href="https://linkedin.com/in/badhri-hari"
          target="_blank"
          rel="noopener"
          className="linkedin"
          title="LinkedIn"
          aria-label="Visit my LinkedIn profile"
        >
          <FaLinkedin className="socials-icons" />
        </a>

        <a
          href="https://github.com/badhri-hari"
          target="_blank"
          rel="noopener"
          className="github"
          title="GitHub"
          aria-label="Visit my GitHub profile"
        >
          <IoLogoGithub className="socials-icons" />
        </a>

        <a
          href="https://reddit.com/u/rise_sol"
          target="_blank"
          rel="noopener"
          className="reddit"
          title="Reddit"
          aria-label="Visit my Reddit profile"
        >
          <FaRedditAlien className="socials-icons" />
        </a>

        <a
          href="https://badhri.vercel.app/rss.xml"
          className="rss"
          title="RSS Feed"
          aria-label="Click on this to access the RSS feed for my webpage and add to your RSS reader if you wish."
        >
          <FaRss className="socials-icons" />
        </a>
      </div>
    </main>
  );
}
