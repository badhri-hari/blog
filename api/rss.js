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

  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  if (isTitle) return `<h2>${escapeHtml(text)}</h2>`;

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

  const now = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const htmlDescription = parseContentToHtml(post.content);
      const link = `https://badhri.pages.dev/post?id=${post.id}`;
      const commentLink = `https://badhri.pages.dev/comment?id=${post.id}`;

      let mediaHtml = "";
      let enclosures = "";

      if (post.media && Array.isArray(post.media)) {
        mediaHtml = post.media
          .map((url) => {
            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
              return `<p><img src="${url}" alt="media" loading="lazy" /></p>`;
            } else if (/youtube\.com|youtu\.be/.test(url)) {
              return `<p><a href="${url}" target="_blank">YouTube Video</a></p>`;
            } else {
              return `<p><a href="${url}" target="_blank">${url}</a></p>`;
            }
          })
          .join("");

        enclosures = post.media
          .filter((url) => /\.(jpg|jpeg|png|gif|webp|mp3|mp4)$/i.test(url))
          .map(
            (url) =>
              `<enclosure url="${url}" type="${
                url.endsWith(".mp3")
                  ? "audio/mpeg"
                  : url.endsWith(".mp4")
                  ? "video/mp4"
                  : "image/jpeg"
              }" />`
          )
          .join("\n");
      }

      return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <comments>${commentLink}</comments>
    <pubDate>${new Date(post.datetime).toUTCString()}</pubDate>
    <dc:creator><![CDATA[Badhri Hari]]></dc:creator>
    <description><![CDATA[${htmlDescription}${mediaHtml}]]></description>
    <content:encoded><![CDATA[${htmlDescription}${mediaHtml}]]></content:encoded>
    ${enclosures}
  </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="https://badhri.vercel.app/rss-viewer.xsl"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>Badhri's Blog</title>
    <link>https://badhri.pages.dev</link>
    <description>Latest blog posts from Badhri Hari</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
    ${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(xml);
}
