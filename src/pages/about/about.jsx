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
          I don't think I could articulate my ideals more accurately than{" "}
          <a href="https://andymasley.com/blog" target="_blank" rel="noopener">
            Andy Masley
          </a> has done:
          <ol style={{fontSize: "inherit"}}>
            <li style={{fontSize: "inherit"}}>Value pluralism: There are multiple ways of achieving the good life, and people have a bad but natural tendency to try to impose a narrow idea of the good life on others.</li>
            <li style={{fontSize: "inherit"}}>Small-L-liberalism: Finding ways to mediate and prevent violence between people with radically different conceptions of the good life to allow for maximum freedom.</li>
            <li style={{fontSize: "inherit"}}>Reducing extreme suffering: In some ways this goes against the first two, but a consistent societal focus on reducing extreme suffering much more than we currently do.</li>
            <li style={{fontSize: "inherit"}}>Valuing non-human animals: Almost all conscious beings in the world are non-human animals. Animal welfare philosophy has been much more marginalized than it ought to be.</li>
          </ol>
        </p>

        <p>
          Less suffering, more well-being <em style={{fontSize: "inherit"}}>(generally)</em>.
        </p>

        <p>
          I write about random topics, mainly politics, the economy,
          urbanism, and technology.
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
          target="_blank"
          rel="noopener"
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
