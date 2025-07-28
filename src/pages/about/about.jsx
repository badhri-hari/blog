import { useEffect, useState } from "preact/hooks";
import { createClient } from "@supabase/supabase-js";

import { FaLinkedin } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";
import { FaRedditAlien, FaRss, FaCheck } from "react-icons/fa";

import "./about.css";

const supabase = createClient(
  "https://umbczydkwxjdfzhsndxm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmN6eWRrd3hqZGZ6aHNuZHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mzk2NDgsImV4cCI6MjA2ODQxNTY0OH0.8cZIyecMqhUO5subqlZhzbWKDIaSrWLmgYewdH6h4VM"
);

const CACHE_KEY = "cached-visitor-count";
const CACHE_TIME_KEY = "cached-visitor-count-at";
const CACHE_EXPIRATION = 2.5 * 60_000;

export default function About() {
  const [visitorCount, setVisitorCount] = useState();
  const [error, setError] = useState();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let storage;
    try {
      storage =
        typeof localStorage !== "undefined" ? localStorage : sessionStorage;
    } catch {
      storage = {
        getItem() {
          return null;
        },
        setItem() {},
      };
    }

    const cachedCount = storage.getItem(CACHE_KEY);
    const cachedTime = storage.getItem(CACHE_TIME_KEY);
    const now = Date.now();

    if (cachedCount && cachedTime) {
      const age = now - parseInt(cachedTime, 10);
      const parsed = Number(cachedCount);
      if (age < CACHE_EXPIRATION && Number.isFinite(parsed)) {
        setVisitorCount(parsed);
        return;
      }
    }

    async function fetchVisitorCount() {
      try {
        const { count, error: countError } = await supabase
          .from("visits")
          .select("*", { count: "exact", head: true });

        if (!countError && typeof count === "number") {
          setVisitorCount(count);
          try {
            const now = Date.now();
            storage.setItem(CACHE_KEY, `${count}`);
            storage.setItem(CACHE_TIME_KEY, `${now}`);
          } catch {}
        } else {
          if (visitorCount === undefined) {
            setError(
              "The database doesn't consider you a visitor, are you an AI model or something?"
            );
          }
        }
      } catch {
        if (visitorCount === undefined) {
          setError(
            "The database doesn't consider you a visitor, are you an AI model or something?"
          );
        }
      }
    }

    fetchVisitorCount();
  }, []);

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

      {visitorCount !== undefined ? (
        <p className="visitor-count">Total Visitors: {visitorCount}</p>
      ) : error ? null : (
        <p className="visitor-count">Loading visitor count...</p>
      )}

      {visitorCount === undefined && error && (
        <p className="visitor-count" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <div className="socials">
        <a
          href="https://linkedin.com/in/badhri-hari"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin"
        >
          <FaLinkedin className="socials-icons" />
        </a>

        <a
          href="https://github.com/badhri-hari"
          target="_blank"
          rel="noopener noreferrer"
          className="github"
        >
          <IoLogoGithub className="socials-icons" />
        </a>

        <a
          href="https://reddit.com/u/rise_sol"
          target="_blank"
          rel="noopener noreferrer"
          className="reddit"
        >
          <FaRedditAlien className="socials-icons" />
        </a>

        <button
          onClick={handleCopyRss}
          className="rss-button"
          aria-label="Copy the RSS feed link for my website to add it to your RSS reader."
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
