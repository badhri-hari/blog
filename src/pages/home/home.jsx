import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import { createClient } from "@supabase/supabase-js";
import DOMPurify from "dompurify";

import "./home.css";
import "./home-mobile.css";
import "./blogText.css";

const supabase = createClient(
  "https://umbczydkwxjdfzhsndxm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmN6eWRrd3hqZGZ6aHNuZHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mzk2NDgsImV4cCI6MjA2ODQxNTY0OH0.8cZIyecMqhUO5subqlZhzbWKDIaSrWLmgYewdH6h4VM"
);

function parseContentToHtml(text, isTitle = false) {
  if (!text) return "";

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  let escaped = escapeHtml(text);

  escaped = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (match, linkText, url) => {
      return `<a href="${url}" target="_blank" title="${url}">${linkText}</a>`;
    }
  );

  escaped = escaped.replace(
    /\*\[([^\]]+)\]/g,
    `<span class="asterisk-wrapper"><span class="asterisk-icon">*</span><span class="asterisk-popup">$1</span></span>`
  );

  if (isTitle) {
    return `<h2>${escaped}</h2>`;
  }

  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${para.replace(/\n/g, " ")}</p>`)
    .join("");

  return paragraphs;
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const limit = 10;
  const offsetRef = useRef(0);
  const observerRef = useRef(null);

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("datetime", { ascending: false })
      .range(offsetRef.current, offsetRef.current + limit - 1);

    if (error) {
      console.error("Error loading blog posts:", error);
      setError("You are not meant to read the texts yet...");
    } else {
      if (data.length < limit) {
        setHasMore(false);
      }
      setPosts((prev) => [...prev, ...data]);
      offsetRef.current += data.length;
    }

    setLoading(false);
  }, [loading, hasMore]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadPosts();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadPosts]
  );

  function isNonYoutubeWebsite(url) {
    const isYouTube =
      url.includes("youtube.com/watch?v=") || url.includes("youtu.be/");
    const imageOrVideoExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "webm",
    ];
    const extension = url.split(".").pop().toLowerCase();

    return (
      !isYouTube &&
      !imageOrVideoExtensions.includes(extension) &&
      url.startsWith("http")
    );
  }

  const lastPostByDate = new Map();
  posts.forEach((post, index) => {
    const dateOnly = post.datetime.split("T")[0];
    lastPostByDate.set(dateOnly, index);
  });

  return (
    <main className="blog-list">
      {error && (
        <article>
          <div className="post-content">
            <p
              style={{
                color: "red",
                textDecoration: "underline",
                fontSize: "1.12rem",
              }}
            >
              {error}
            </p>
          </div>
        </article>
      )}

      {posts.length === 0 && !loading && !error && (
        <article>
          <div className="post-content">
            <p>No posts found.</p>
          </div>
        </article>
      )}

      {posts.map((post, index) => {
        const dateOnly = post.datetime.split("T")[0];
        const isLastPostOfDate = lastPostByDate.get(dateOnly) === index;

        const isLastPost = index === posts.length - 1;

        return (
          <article key={post.id || index} ref={isLastPost ? lastPostRef : null}>
            <header
              className="post-title"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  parseContentToHtml(post.title, true)
                ),
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
                {post.media.map((src, i) => {
                  const extension = src.split(".").pop().toLowerCase();
                  const isYouTube =
                    src.includes("youtube.com/watch?v=") ||
                    src.includes("youtu.be/");
                  if (isYouTube) {
                    let videoId = "";

                    if (src.includes("youtube.com/watch?v=")) {
                      const url = new URL(src);
                      videoId = url.searchParams.get("v");
                    } else if (src.includes("youtu.be/")) {
                      videoId = src.split("youtu.be/")[1].split(/[?&]/)[0];
                    }

                    if (videoId) {
                      return (
                        <iframe
                          key={i}
                          className="blog-media"
                          loading="lazy"
                          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                          title={`YouTube video ${i + 1}`}
                          allowFullScreen
                          referrerPolicy="no-referrer"
                        />
                      );
                    }
                  }

                  if (["mp4", "webm"].includes(extension)) {
                    return (
                      <video
                        key={i}
                        controls
                        className="blog-media"
                        loading="lazy"
                        aria-label={`Video content ${i + 1}`}
                      >
                        <source src={src} type={`video/${extension}`} />
                        Your browser does not support the video tag.
                      </video>
                    );
                  } else if (
                    ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
                  ) {
                    return (
                      <img
                        key={i}
                        src={src}
                        alt={`Blog media ${i + 1}`}
                        className="blog-media"
                        loading="lazy"
                      />
                    );
                  } else {
                    return (
                      <a
                        key={i}
                        href={src}
                        className="blog-media website-link"
                        target="_blank"
                      >
                        {src.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    );
                  }
                })}
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
              {isLastPostOfDate &&
                new Date(post.datetime).toLocaleString("en-US", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
            </time>
          </article>
        );
      })}

      {loading && (
        <article>
          <div className="post-content">
            <p style={{ fontSize: "1.12rem" }}>Loading...</p>
          </div>
        </article>
      )}
    </main>
  );
}
