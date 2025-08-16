import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import { FaRegComment } from "react-icons/fa";
import DOMPurify from "dompurify";

import useCachedSupabase, {
  setCachedData,
} from "../../../hooks/useCachedSupabase";

import {
  parseContentToHtml,
  isNonYoutubeWebsite,
  getLocalDateOnly,
} from "../../../utils/showingPostsUtils";
import renderMedia from "../../../utils/mediaGallery";
import { supabase } from "../../../utils/supabase";

import "./home.css";
import "./home-mobile.css";
import "./blogText.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const limit = 10;
  const offsetRef = useRef(0);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const loadPosts = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    observerRef.current?.disconnect();
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .order("datetime", { ascending: false })
        .range(offsetRef.current, offsetRef.current + limit - 1);

      if (fetchError) {
        console.error("Error loading blog posts:", fetchError);
        setError("go away, the site needs its beauty sleep");
      } else {
        if (data.length < limit) setHasMore(false);
        setPosts((prev) => {
          const merged = [...prev, ...data];
          offsetRef.current += data.length;
          try {
            setCachedData("cached-posts", merged);
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      setError("go away, the site needs its beauty sleep");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore]);

  const { data: initialData, loading: ready } = useCachedSupabase({
    key: "cached-posts",
    expiration: 2.5 * 60_000,
    fetcher: async () => {
      const result = await supabase
        .from("posts")
        .select("*")
        .order("datetime", { ascending: false })
        .limit(10);

      return result;
    },
  });

  useEffect(() => {
    if (!ready) return;

    if (initialData && initialData.length > 0) {
      setPosts(initialData);
      offsetRef.current = initialData.length;
      setHasMore(initialData.length >= limit);
    } else {
      setPosts([]);
      offsetRef.current = 0;
      setHasMore(true);
      loadPosts();
    }
  }, [ready]);

  const lastPostRef = useCallback(
    (node) => {
      if (loadingRef.current) return;
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadPosts();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loadPosts]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const lastPostByDate = new Map();
  posts.forEach((post, index) => {
    const dateOnly = getLocalDateOnly(post.datetime);
    lastPostByDate.set(dateOnly, index);
  });

  useEffect(() => {
    const togglePopup = (e) => {
      const popup = e.target.closest(".asterisk-popup");
      if (popup) {
        return;
      }

      const wrapper = e.target.closest(".asterisk-wrapper");

      if (!wrapper) {
        document.querySelectorAll(".asterisk-wrapper.active").forEach((el) => {
          el.classList.remove("active");
        });
        return;
      }

      document.querySelectorAll(".asterisk-wrapper.active").forEach((el) => {
        if (el !== wrapper) el.classList.remove("active");
      });

      wrapper.classList.toggle("active");
    };

    document.addEventListener("click", togglePopup);

    return () => {
      document.removeEventListener("click", togglePopup);
    };
  }, []);

  return (
    <main className="blog-list">
      {error && (
        <article>
          <div className="post-content">
            <p
              style={{
                color: "red",
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
        const dateOnly = getLocalDateOnly(post.datetime);
        const isLastPostOfDate = lastPostByDate.get(dateOnly) === index;
        const isLastPost = index === posts.length - 1;
        return (
          <article key={post.id || index} ref={isLastPost ? lastPostRef : null}>
            <header className="post-title">
              <a
                href={`/post?id=${post.id}`}
                title={`Permanent page and history for "${post.title}"`}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      parseContentToHtml(post.title, true)
                    ),
                  }}
                />
              </a>
            </header>

            <div
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(parseContentToHtml(post.content), {
                  ADD_ATTR: ["target"],
                }),
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

            <div className="post-bottom-row">
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

              <div>
                <a
                  href={`/comments?id=${post.id}`}
                  className="comment-icon"
                  title={`View comments for "${post.title}"`}
                  aria-label={`Open comments page for the post titled "${post.title}"`}
                >
                  <FaRegComment size="20" />
                </a>
              </div>
            </div>
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
