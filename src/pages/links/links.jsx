import { createClient } from "@supabase/supabase-js";
import DOMPurify from "dompurify";

import useCachedSupabase from "../../../hooks/useCachedSupabase";

import "./links.css";

const supabase = createClient(
  "https://umbczydkwxjdfzhsndxm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmN6eWRrd3hqZGZ6aHNuZHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mzk2NDgsImV4cCI6MjA2ODQxNTY0OH0.8cZIyecMqhUO5subqlZhzbWKDIaSrWLmgYewdH6h4VM"
);

export default function Links() {
  const {
    data: links,
    loading,
    error,
  } = useCachedSupabase({
    key: "cached-links",
    expiration: 2.5 * 60_000,
    fetcher: () =>
      supabase.from("links").select("*").order("id", { ascending: true }),
  });

  function parseMarkdownLinks(text) {
    if (!text) return "";
    return text.replace(
      /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g,
      (_, text, url) =>
        `<a href="${url}" target="_blank" title="${url}" rel="noopener noreferrer">${text}</a>`
    );
  }

  return (
    <main className="random-links">
      {loading && (
        <div className="links">
          <p style={{ fontSize: "1.12rem" }}>Loading...</p>
        </div>
      )}

      {error && (
        <div className="links">
          <p
            style={{
              fontSize: "1.12rem",
              color: "red",
              textDecoration: "underline",
            }}
          >
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          <h1>Random Links</h1>
          {links.map((link, index) => (
            <div className="links" key={link.id || index}>
              <h2>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.title}
                </a>
              </h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    parseMarkdownLinks(link.description),
                    { ADD_ATTR: ["target"] }
                  ),
                }}
              />
            </div>
          ))}
        </>
      )}
    </main>
  );
}
