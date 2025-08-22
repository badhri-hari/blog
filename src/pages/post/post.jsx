import { useEffect, useState } from "preact/hooks";
import DOMPurify from "dompurify";

import {
  parseContentToHtml,
  isNonYoutubeWebsite,
} from "../../../utils/showingPostsUtils";
import renderMedia from "../../../utils/mediaGallery";
import { supabase } from "../../../utils/supabase";

import "../home/home.css";
import "../home/home-mobile.css";
import "../home/blogText.css";
import "./post.css";

export default function Post() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("post ID enga kanum?");
      return;
    }

    setLoading(true);

    Promise.all([
      supabase.from("posts").select("*").eq("id", id).single(),
      supabase
        .from("post_versions")
        .select("*")
        .eq("post_id", id)
        .order("version", { ascending: false }),
    ])
      .then(([currentResult, historyResult]) => {
        const { data: curr, error: err1 } = currentResult;
        const { data: hist, error: err2 } = historyResult;

        if (err1 || err2) {
          setError("Failed to load post, or its history idk.");
          return;
        }

        if (!curr) {
          setError("This post is not available (only for you)");
          return;
        }

        const filtered = (hist || []).filter((v) => v.version !== 2);

        let reindexed = [];
        if (filtered.length > 1) {
          reindexed = filtered.map((v, i) => ({
            ...v,
            version: filtered.length - i,
          }));
        }

        setCurrent(curr);
        setHistory(reindexed);
      })
      .catch(() => {
        setError("Something went wrong.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (error)
    return <p style={{ color: "red", fontSize: "1.12rem" }}>{error}</p>;

  if (loading)
    return (
      <main className="blog-list">
        <article>
          <div className="post-content">
            <p style={{ fontSize: "1.12rem" }}>Loading...</p>
          </div>
        </article>
      </main>
    );

  return (
    <main className="blog-list">
      {current && (
        <>
          <p className="post-page-title">Post history</p>
          <div className="post-info">
            <p>
              <strong style={{ fontSize: "inherit" }}>Post ID:</strong>{" "}
              {current.id}
            </p>
            <p>
              <button
                onClick={() => {
                  const url = window.location.href;

                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard
                      .writeText(url)
                      .then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                      })
                      .catch(() => fallbackCopy(url));
                  } else {
                    fallbackCopy(url);
                  }

                  function fallbackCopy(text) {
                    const textarea = document.createElement("textarea");
                    textarea.value = text;
                    textarea.setAttribute("readonly", "");
                    textarea.style.position = "absolute";
                    textarea.style.left = "-9999px";
                    document.body.appendChild(textarea);
                    textarea.select();

                    try {
                      document.execCommand("copy");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    } catch (err) {
                      alert("Copy failed. Please copy the URL manually.");
                    }

                    document.body.removeChild(textarea);
                  }
                }}
                style={copied ? {} : { textDecoration: "underline" }}
              >
                {copied ? (
                  <span style={{ color: "#ff4f00", fontSize: "inherit" }}>
                    Copied!
                  </span>
                ) : (
                  "Copy permanent post URL"
                )}
              </button>
            </p>
            <p>
              <a
                href={`/comments?id=${current.id}`}
                title={`Comments for "${current.title}"`}
                style={{ textDecoration: "none", marginTop: "5px", color: "#ff4f00" }}
              >
                Open comments page
              </a>
            </p>
          </div>

          <article key={current.id}>
            <header
              className="post-title"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  parseContentToHtml(current.title, true)
                ),
              }}
            />
            <div
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(parseContentToHtml(current.content)),
              }}
            />
            {Array.isArray(current.media) && current.media.length > 0 && (
              <div
                className="media-gallery"
                style={
                  current.media.length > 1
                    ? { padding: "10px 10px" }
                    : isNonYoutubeWebsite(current.media[0])
                    ? {
                        justifyContent: "center",
                        backgroundColor: "#121212",
                        padding: "10px",
                      }
                    : {}
                }
              >
                {current.media.map((src, i) => renderMedia(src, i))}
              </div>
            )}

            <time
              dateTime={current.datetime}
              title={new Date(current.datetime).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZoneName: "short",
              })}
            >
              {new Date(current.datetime).toLocaleString("en-US", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              <strong style={{ fontSize: "inherit" }}> — latest version</strong>
            </time>
          </article>
        </>
      )}

      {history.length > 0 && <hr className="post-hr" />}

      {history.map((post, index) => (
        <article key={post.id}>
          <header
            className="post-title"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(parseContentToHtml(post.title, true)),
            }}
          />
          <div
            className="post-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(parseContentToHtml(post.content)),
            }}
          />
          {Array.isArray(post.media) && post.media.length > 0 && (
            <div
              className="media-gallery"
              style={
                post.media.length > 1
                  ? { padding: "10px 10px" }
                  : isNonYoutubeWebsite(post.media[0])
                  ? {
                      justifyContent: "center",
                      backgroundColor: "#121212",
                      padding: "10px",
                    }
                  : {}
              }
            >
              {post.media.map((src, i) => renderMedia(src, i))}
            </div>
          )}

          <time
            dateTime={post.datetime}
            title={new Date(post.datetime).toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZoneName: "short",
            })}
          >
            {new Date(post.datetime).toLocaleString("en-US", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            <strong style={{ fontSize: "inherit" }}>
              — version {post.version}
            </strong>
          </time>
        </article>
      ))}
    </main>
  );
}
