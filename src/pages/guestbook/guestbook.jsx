import { useState, useEffect } from "preact/hooks";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { supabase } from "../../../utils/supabase";
import useCachedSupabase from "../../../hooks/useCachedSupabase";

import "../home/home.css";
import "../home/home-mobile.css";
import "../home/blogText.css";
import "../post/post.css";
import "./guestbook.css";

const CACHE_KEY = "cached-visitor-count";
const CACHE_TIME_KEY = "cached-visitor-count-at";
const CACHE_EXPIRATION = 2.5 * 60_000;

export default function Guestbook() {
  const [visitorCount, setVisitorCount] = useState();
  const [comments, setComments] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const [likedComments, setLikedComments] = useState(new Set());
  const [userIP, setUserIP] = useState(null);

  useEffect(() => {
    async function getIP() {
      try {
        const cached = localStorage.getItem("userIP");
        if (cached) {
          setUserIP(cached);
          return;
        }

        const res = await fetch("https://ipapi.co/json");
        const geo = await res.json();
        localStorage.setItem("userIP", geo.ip);
        setUserIP(geo.ip);
      } catch {
        console.warn("Could not get IP.");
      }
    }

    getIP();
  }, []);

  const {
    data: initialData,
    loading,
    error,
  } = useCachedSupabase({
    key: "cached-guestbook",
    expiration: 5 * 60_000,
    fetcher: async () => {
      const { data, error } = await supabase
        .from("guestbook")
        .select("id, name, comment, datetime, like_count")
        .order("datetime", { ascending: false })
        .limit(30);

      return { data, error };
    },
  });

  useEffect(() => {
    if (!loading && Array.isArray(initialData)) {
      setComments(initialData);
      const initCounts = initialData.reduce((acc, c) => {
        acc[c.id] = c.like_count ?? 0;
        return acc;
      }, {});
      setLikeCounts(initCounts);
    }
  }, [loading, initialData]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "likedComments",
        JSON.stringify(Array.from(likedComments))
      );
    } catch {}
  }, [likedComments]);

  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem("likedComments");
      if (storedLikes) {
        setLikedComments(new Set(JSON.parse(storedLikes)));
      }
    } catch {}
  }, []);

  async function recordComment(name, comment, email) {
    try {
      setSubmitting(true);
      const res = await fetch("https://ipapi.co/json");
      const geo = await res.json();

      const insertData = {
        name,
        email: email || null,
        comment,
        datetime: new Date().toISOString(),
        ip_address: geo.ip,
        country: geo.country_name,
        city: geo.city,
        user_agent: navigator.userAgent,
        like_count: 0,
      };

      const { error } = await supabase.from("guestbook").insert([insertData]);
      if (error) {
        console.error("Error inserting comment:", error);
      } else {
        setNameInput("");
        setEmailInput("");
        setCommentInput("");
        const { data } = await supabase
          .from("guestbook")
          .select("id, name, comment, datetime, like_count")
          .order("datetime", { ascending: false })
          .limit(30);
        setComments(data);
      }
    } catch (e) {
      console.error("Geo lookup or insert failed:", e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(id, commentAuthorIP) {
    const isOwnComment = commentAuthorIP === userIP;
    const isLiked = likedComments.has(id);
    const currentCount = likeCounts[id] || 0;

    const newCount = isLiked ? currentCount - 1 : currentCount + 1;
    const updatedLikes = new Set(likedComments);

    if (isLiked) {
      updatedLikes.delete(id);
    } else {
      updatedLikes.add(id);
    }

    setLikeCounts({ ...likeCounts, [id]: newCount });
    setLikedComments(updatedLikes);

    const { error } = await supabase
      .from("guestbook")
      .update({ like_count: newCount })
      .eq("id", id)
      .select();

    if (error) console.error("Error updating like_count:", error);
  }

  useEffect(() => {
    let storage;
    try {
      storage =
        typeof localStorage !== "undefined" ? localStorage : sessionStorage;
    } catch {
      storage = { getItem: () => null, setItem: () => {} };
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
          storage.setItem(CACHE_KEY, `${count}`);
          storage.setItem(CACHE_TIME_KEY, `${now}`);
        } else if (visitorCount === undefined) {
          setError("Could not retrieve visitor count.");
        }
      } catch {
        if (visitorCount === undefined) {
          setError("Could not retrieve visitor count.");
        }
      }
    }

    fetchVisitorCount();
  }, []);

  return (
    <main className="blog-list">
      <p
        className="post-page-title guestbook-title"
        title="Guestbooks are a way to leave comments on a website."
      >
        Guestbook
      </p>

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

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (commentInput.trim()) {
            const nameToUse = nameInput.trim() || "anonymous";
            await recordComment(
              nameToUse,
              commentInput.trim(),
              emailInput.trim()
            );
          }
        }}
      >
        <input
          type="text"
          value={nameInput}
          onInput={(e) => setNameInput(e.target.value)}
          placeholder="Name (optional)"
          maxLength={30}
          className="name-input"
        />

        <input
          type="email"
          value={emailInput}
          onInput={(e) => setEmailInput(e.target.value)}
          placeholder="Email (optional, not shown publicly)"
          maxLength={50}
          className="name-input"
        />

        <textarea
          value={commentInput}
          onInput={(e) => setCommentInput(e.target.value)}
          placeholder="Comment (required)"
          maxLength={500}
          rows={1}
          className="comment-input"
          required
        />

        <button type="submit" disabled={submitting} className="submit-button">
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {error && (
        <article>
          <div className="post-content">
            <p
              style={{
                color: "red",
                fontSize: "1.12rem",
              }}
            >
              The comments feel a bit shy right now, come back later.
            </p>
          </div>
        </article>
      )}

      {comments.length === 0 && !loading && !error && (
        <article>
          <div className="post-content">
            <p>No comments yet :(</p>
          </div>
        </article>
      )}

      {loading && (
        <article>
          <div className="post-content">
            <p style={{ fontSize: "1.12rem" }}>Loading...</p>
          </div>
        </article>
      )}

      {comments.map(({ id, name, comment, datetime, ip_address }, i) => (
        <>
          <article key={id ?? i}>
            <header className="post-title">
              <h2>{name}</h2>
            </header>
            {comment && (
              <div className="post-content">
                <p>{comment}</p>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <time
                className="comment-date"
                dateTime={datetime}
                title={new Date(datetime).toLocaleString("en-US", {
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
                {new Date(datetime).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })}
              </time>
              <div className="like-container">
                <button
                  className="like-button"
                  onClick={() => handleLike(id, ip_address)}
                  title={
                    likedComments.has(id)
                      ? "Click to unlike"
                      : "Click to like the comment"
                  }
                >
                  {likedComments.has(id) ? (
                    <FaHeart size={16} style={{ color: "#ff4f00" }} />
                  ) : (
                    <FaRegHeart size={16} style={{ color: "white" }} />
                  )}
                  <span className="like-count" style={{ marginLeft: "0.4rem" }}>
                    {likeCounts[id] ?? 0}
                  </span>
                </button>
              </div>
            </div>
          </article>
          <hr className="comment-separator" />
        </>
      ))}
    </main>
  );
}
