import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://umbczydkwxjdfzhsndxm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmN6eWRrd3hqZGZ6aHNuZHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mzk2NDgsImV4cCI6MjA2ODQxNTY0OH0.8cZIyecMqhUO5subqlZhzbWKDIaSrWLmgYewdH6h4VM"
);

function escapeXml(str) {
  return str.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      }[c])
  );
}

export default async function handler(req, res) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return res.status(500).send("Failed to load posts");

  const items = posts
    .map(
      (post) => `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>https://badhri.vercel.app/post/${post.id}</link>
    <guid>https://badhri.vercel.app/post/${post.id}</guid>
    <pubDate>${new Date(post.datetime).toUTCString()}</pubDate>
    <description><![CDATA[${post.content}]]></description>
  </item>
`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Badhri's Blog</title>
      <link>https://badhri.vercel.app</link>
      <description>Latest posts from Badhri's site.</description>
      <language>en-us</language>
      ${items}
    </channel>
  </rss>`;

  res.setHeader("Content-Type", "application/rss+xml");
  res.status(200).send(xml);
}
