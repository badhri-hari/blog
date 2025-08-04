import { useState } from "preact/hooks";
import DOMPurify from "dompurify";

import useCachedSupabase from "../../../hooks/useCachedSupabase";
import { supabase } from "../../../utils/supabase";

import "./links.css";
import "./links-mobile.css";

export default function Links() {
  const [openCategories, setOpenCategories] = useState({});

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
        `<a href="${url}" target="_blank" title="${url}" rel="noopener">${text}</a>`
    );
  }

  function mapLinksByCategory(linksArray) {
    const categoryMap = {};

    for (const link of linksArray) {
      const categories = Array.isArray(link.category)
        ? link.category
        : ["Uncategorized"];

      for (const cat of categories) {
        const trimmedCat = cat.trim();
        if (!categoryMap[trimmedCat]) categoryMap[trimmedCat] = [];
        categoryMap[trimmedCat].push(link);
      }
    }

    return categoryMap;
  }

  function toggleCategory(cat) {
    setOpenCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
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
          {Object.entries(mapLinksByCategory(links)).map(
            ([category, categoryLinks]) => {
              const isOpen = openCategories[category];
              return (
                <div key={category}>
                  <p
                    className="link-category-title collapsible"
                    onClick={() => toggleCategory(category)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    {category}{" "}
                    <span className="collapsible-triangle-indicator">
                      {isOpen ? "▼" : "▶"}
                    </span>
                  </p>
                  <hr className="link-hr" />
                  {isOpen &&
                    categoryLinks.map((link) => (
                      <div className="links" key={link.id}>
                        <h2>
                          <a href={link.url} target="_blank" rel="noopener">
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
                </div>
              );
            }
          )}
        </>
      )}
    </main>
  );
}
