import { useState, useEffect } from "preact/hooks";
// import { FaHeart, FaRegHeart } from "react-icons/fa";

// import { supabase } from "../../../utils/supabase";
// import useCachedSupabase from "../../../hooks/useCachedSupabase";

import "../home/home.css";
import "../home/home-mobile.css";
import "../home/blogText.css";
import "../post/post.css";
import "./chat.css";

export default function Chat() {
  const [visitorCount, setVisitorCount] = useState();
  const [error, setError] = useState(null);

  // const [comments, setComments] = useState([]);
  // const [nameInput, setNameInput] = useState("");
  // const [emailInput, setEmailInput] = useState("");
  // const [commentInput, setCommentInput] = useState("");
  // const [submitting, setSubmitting] = useState(false);
  // const [likeCounts, setLikeCounts] = useState({});
  // const [likedComments, setLikedComments] = useState(new Set());

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://iframe.chat/scripts/main.min.js";
    script.async = true;
    script.onload = () => {
      if (window.chattable) {
        window.chattable.initialize({
          stylesheet: "/chattable.css",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      const iframe = document.getElementById("chattable");
      if (iframe) iframe.remove();
    };
  }, []);

  useEffect(() => {
    async function fetchVisitorCount() {
      try {
        const res = await fetch(
          "https://badhri.goatcounter.com/counter/TOTAL.json"
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setVisitorCount(data.count_unique);
      } catch (e) {
        console.error("Error fetching GoatCounter visitor count:", e);
        setError(
          "adblocker enabled? you'll have to go here to see the page analytics: badhri.goatcounter.com"
        );
      }
    }

    fetchVisitorCount();
  }, []);

  // const { data: initialData, loading } = useCachedSupabase({
  //   key: "cached-guestbook",
  //   expiration: 5 * 60_000,
  //   fetcher: async () => {
  //     const { data, error } = await supabase
  //       .from("guestbook")
  //       .select("id, name, comment, datetime, like_count")
  //       .order("datetime", { ascending: false })
  //       .limit(30);

  //     return { data, error };
  //   },
  // });

  // useEffect(() => {
  //   if (Array.isArray(initialData)) {
  //     setComments(initialData);
  //     const initCounts = initialData.reduce((acc, c) => {
  //       acc[c.id] = c.like_count ?? 0;
  //       return acc;
  //     }, {});
  //     setLikeCounts(initCounts);
  //   }
  // }, [initialData]);

  // async function recordComment(name, comment, email) {
  //   try {
  //     setSubmitting(true);
  //     const insertData = {
  //       name,
  //       email: email || null,
  //       comment,
  //       datetime: new Date().toISOString(),
  //       like_count: 0,
  //     };

  //     const { error } = await supabase.from("guestbook").insert([insertData]);
  //     if (error) {
  //       console.error("Error inserting comment:", error);
  //     } else {
  //       setNameInput("");
  //       setEmailInput("");
  //       setCommentInput("");
  //       const { data } = await supabase
  //         .from("guestbook")
  //         .select("id, name, comment, datetime, like_count")
  //         .order("datetime", { ascending: false })
  //         .limit(30);
  //       setComments(data);
  //     }
  //   } catch (e) {
  //     console.error("Insert failed:", e);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }

  // async function handleLike(id) {
  //   const isLiked = likedComments.has(id);
  //   const currentCount = likeCounts[id] || 0;
  //   const newCount = isLiked ? currentCount - 1 : currentCount + 1;
  //   const updatedLikes = new Set(likedComments);

  //   if (isLiked) {
  //     updatedLikes.delete(id);
  //   } else {
  //     updatedLikes.add(id);
  //   }

  //   setLikeCounts({ ...likeCounts, [id]: newCount });
  //   setLikedComments(updatedLikes);

  //   const { error } = await supabase
  //     .from("guestbook")
  //     .update({ like_count: newCount })
  //     .eq("id", id)
  //     .select();

  //   if (error) console.error("Error updating like_count:", error);
  // }

  return (
    <main className="blog-list">
      {/* <p className="post-page-title guestbook-title"></p> */}

      {visitorCount !== undefined ? (
        <p className="visitor-count" style={{ marginTop: "2px" }}>
          Total Visitors: {visitorCount}
        </p>
      ) : error ? (
        <p className="visitor-count" style={{ marginTop: "2px" }}>
          {error}
        </p>
      ) : (
        <p className="visitor-count" style={{ marginTop: "2px" }}>
          Loading visitor count...
        </p>
      )}

      {/* <form
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
      </form> */}

      <iframe
        src="https://iframe.chat/embed?chat=25188300"
        id="chattable"
        className="chattable-iframe"
        loading="eager"
        title="Live Chat with others using the Chat-table i-frame"
        frameBorder="0"
      />

      {/* {comments.map(({ id, name, comment, datetime }) => (
        <>
          <article key={id}>
            <header className="post-title">
              <h2>{name}</h2>
            </header>
            {comment && (
              <div className="post-content">
                <p>{comment}</p>
              </div>
            )}
            <div className="like-container">
              <button
                className="like-button"
                onClick={() => handleLike(id)}
                title={
                  likedComments.has(id) ? "Click to unlike" : "Click to like"
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
          </article>
          <hr className="comment-separator" />
        </>
      ))} */}
    </main>
  );
}
