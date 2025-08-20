import { useEffect, useState } from "preact/hooks";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { supabase } from "../../../utils/supabase";
import useCachedSupabase from "../../../hooks/useCachedSupabase";

import "./comments.css";
import "../home/home.css";
import "../home/home-mobile.css";
import "../home/blogText.css";
import "../post/post.css";
import "../guestbook/guestbook.css";

function getSessionId() {
  try {
    let s = localStorage.getItem("anonSessionId");
    if (!s) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        s = crypto.randomUUID();
      } else {
        s = "anon-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
      }
      localStorage.setItem("anonSessionId", s);
    }
    return s;
  } catch (e) {
    return "temp-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
  }
}

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

  const sessionId = getSessionId();

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
        if (error || !data) setError("Could not fetch the post title.");
        else setPostTitle(data.title);
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
        .select("id, name, comment, datetime, like_count, liked_sessions")
        .eq("post_id", postId)
        .order("datetime", { ascending: false })
        .limit(50);

      return { data, error };
    },
  });

  useEffect(() => {
    if (!commentsLoading && Array.isArray(initialData)) {
      setComments(initialData);
      const counts = {};
      const likedSet = new Set();
      initialData.forEach((c) => {
        counts[c.id] = c.like_count ?? 0;
        if (
          Array.isArray(c.liked_sessions) &&
          c.liked_sessions.includes(sessionId)
        ) {
          likedSet.add(c.id);
        }
      });
      setLikeCounts(counts);
      setLikedComments(likedSet);
    }
  }, [commentsLoading, initialData, sessionId]);

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

  async function recordComment(name, comment, email) {
    try {
      setSubmitting(true);

      const insertData = {
        post_id: postId,
        name,
        email: email || null,
        comment,
        datetime: new Date().toISOString(),
        like_count: 0,
        liked_sessions: [],
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
          .select("id, name, comment, datetime, like_count, liked_sessions")
          .eq("post_id", postId)
          .order("datetime", { ascending: false })
          .limit(50);
        if (Array.isArray(data)) setComments(data);
      }
    } catch (e) {
      console.error("Comment submission failed:", e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(commentId) {
    try {
      const { data: rows, error: fetchErr } = await supabase
        .from("comments")
        .select("liked_sessions, like_count")
        .eq("id", commentId)
        .single();

      if (fetchErr || !rows) {
        console.error("Could not fetch comment for toggling like:", fetchErr);
        return;
      }

      const currentSessions = Array.isArray(rows.liked_sessions)
        ? rows.liked_sessions.slice()
        : [];
      const currentCount = rows.like_count || 0;
      const hasLiked = currentSessions.includes(sessionId);

      let newSessions;
      let newCount;
      if (hasLiked) {
        newSessions = currentSessions.filter((s) => s !== sessionId);
        newCount = Math.max(0, currentCount - 1);
      } else {
        newSessions = currentSessions.concat([sessionId]);
        newCount = currentCount + 1;
      }

      const { error: updateErr } = await supabase
        .from("comments")
        .update({
          liked_sessions: newSessions,
          like_count: newCount,
        })
        .eq("id", commentId);

      if (updateErr) {
        console.error("Could not update like:", updateErr);
        return;
      }

      setLikeCounts((prev) => ({ ...prev, [commentId]: newCount }));
      setLikedComments((prev) => {
        const setCopy = new Set(prev);
        if (hasLiked) setCopy.delete(commentId);
        else setCopy.add(commentId);
        return setCopy;
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, liked_sessions: newSessions, like_count: newCount }
            : c
        )
      );
    } catch (e) {
      console.error("Error toggling like:", e);
    }
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

      {comments.map(({ id, name, comment, datetime }) => (
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
                title={new Date(datetime).toLocaleString()}
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
                  onClick={() => handleLike(id)}
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
