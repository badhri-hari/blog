import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// parseContentToHtml is taken directly from the utils folder, hence if it is updated there
// it must be updated here as well.

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

  if (isTitle) {
    return `<h2>${escapeHtml(text)}</h2>`;
  }

  const paragraphs = text
    .split(/\n+/)
    .flatMap((line) =>
      line
        .split(/(?<!\|)\|(?!\|)/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .map((rawPara) => {
      const isBlockquote = /^\|\|"\s*[^"]+\s*"\s*-\s*.+$/s.test(rawPara);
      const cleanPara = isBlockquote ? rawPara.replace(/^\|\|/, "") : rawPara;
      let escaped = escapeHtml(cleanPara);

      escaped = escaped
        .replace(/\*\*(.*?)\*\*/g, "<strong class='blog-text'>$1</strong>")
        .replace(/_([^_]+)_/g, "<em class='blog-text'>$1</em>")
        .replace(/__(.*?)__/g, "<u class='blog-text'>$1</u>")
        .replace(
          /\[([^\]]+)\]\((https?:\/\/[^\s)]+(?:\([^\s)]+\))*)\)/g,
          (match, linkText, url) =>
            `<a href="${url}" target="_blank" title="${url}">${linkText}</a>`
        )
        .replace(
          /\*\[([^\]]+)\]/g,
          `<span class="asterisk-wrapper"><span class="asterisk-icon">*</span><span class="asterisk-popup">$1</span></span>`
        );

      return isBlockquote
        ? `<p role="quote" class="blockquote">${escaped}</p>`
        : `<p>${escaped}</p>`;
    })
    .join("");

  return paragraphs;
}

export default async function handler(req, res) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("datetime", { ascending: false })
    .limit(20);

  if (error) return res.status(500).send("Failed to load posts");

  const items = posts
    .map((post) => {
      const htmlDescription = parseContentToHtml(post.content);
      return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>https://badhri.pages.dev/post?id=${post.id}</link>
    <guid>https://badhri.pages.dev/post?id=${post.id}</guid>
    <pubDate>${new Date(post.datetime).toUTCString()}</pubDate>
    <description><![CDATA[${htmlDescription}]]></description>
    <content:encoded><![CDATA[${htmlDescription}]]></content:encoded>
  </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <?xml-stylesheet type="text/xsl" href="https://badhri.vercel.app/rss-viewer.xsl"?>
  <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
      <title>Badhri's Blog</title>
      <author>Badhri Hari</author>
      <link>https://badhri.pages.dev</link>
      <description>Latest blog posts from my site.</description>
      <language>en-us</language>
      ${items}
    </channel>
  </rss>`;

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(xml);
}
