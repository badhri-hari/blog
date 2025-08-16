import { useEffect, useState } from "preact/hooks";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { supabase } from "../../../utils/supabase";
import useCachedSupabase from "../../../hooks/useCachedSupabase";

import "./comments.css"
import "../home/home.css";
import "../home/home-mobile.css";
import "../home/blogText.css";
import "../post/post.css";
import "../guestbook/guestbook.css";

export default function Comments() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  const [postTitle, setPostTitle] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const [likedComments, setLikedComments] = useState(new Set());
  const [userIP, setUserIP] = useState(null);

  useEffect(() => {
    if (!postId) {
      setError("post ID enga kanum?");
      return;
    }

    setLoading(true);
    supabase
      .from("posts")
      .select("title")
      .eq("id", postId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("Could not fetch the post title.");
        } else {
          setPostTitle(data.title);
        }
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, [postId]);

  const {
    data: initialData,
    loading: commentsLoading,
    error: commentsError,
  } = useCachedSupabase({
    key: `comments-${postId}`,
    expiration: 5 * 60_000,
    fetcher: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, name, comment, datetime, like_count, ip_address")
        .eq("post_id", postId)
        .order("datetime", { ascending: false })
        .limit(50);

      return { data, error };
    },
  });

  useEffect(() => {
    if (!commentsLoading && Array.isArray(initialData)) {
      setComments(initialData);
      const counts = initialData.reduce((acc, c) => {
        acc[c.id] = c.like_count ?? 0;
        return acc;
      }, {});
      setLikeCounts(counts);
    }
  }, [commentsLoading, initialData]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "likedPostComments",
        JSON.stringify(Array.from(likedComments))
      );
    } catch {}
  }, [likedComments]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("likedPostComments");
      if (stored) setLikedComments(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

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

  async function recordComment(name, comment, email) {
    try {
      setSubmitting(true);
      const res = await fetch("https://ipapi.co/json");
      const geo = await res.json();

      const insertData = {
        post_id: postId,
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

      const { error } = await supabase.from("comments").insert([insertData]);
      if (error) {
        console.error("Insert error:", error);
      } else {
        setNameInput("");
        setEmailInput("");
        setCommentInput("");
        const { data } = await supabase
          .from("comments")
          .select("id, name, comment, datetime, like_count, ip_address")
          .eq("post_id", postId)
          .order("datetime", { ascending: false })
          .limit(50);
        setComments(data);
      }
    } catch (e) {
      console.error("Comment submission failed:", e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(id, authorIP) {
    const isOwn = authorIP === userIP;
    const isLiked = likedComments.has(id);
    const count = likeCounts[id] || 0;
    const newCount = isLiked ? count - 1 : count + 1;

    const updated = new Set(likedComments);
    if (isLiked) updated.delete(id);
    else updated.add(id);

    setLikeCounts({ ...likeCounts, [id]: newCount });
    setLikedComments(updated);

    const { error } = await supabase
      .from("comments")
      .update({ like_count: newCount })
      .eq("id", id);

    if (error) console.error("Error updating like_count:", error);
  }

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
      <p className="comments-page-title post-page-title guestbook-title">
        <a
          href={`/post?id=${postId}`}
          title={`Permanent page and history for "${postTitle}"`}
        >
          Comments for "{postTitle}"
        </a>
      </p>

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

      {commentsError && (
        <p style={{ color: "red", fontSize: "1.12rem" }}>
          Could not load comments.
        </p>
      )}

      {comments.length === 0 && !commentsLoading && !commentsError && (
        <p>No comments yet :(</p>
      )}

      {commentsLoading && <p style={{ fontSize: "1.12rem" }}>Loading...</p>}

      {comments.map(({ id, name, comment, datetime, ip_address }) => (
        <div key={id}>
          <article>
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
                justifyContent: "space-between",
                alignItems: "center",
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
        </div>
      ))}
    </main>
  );
}
