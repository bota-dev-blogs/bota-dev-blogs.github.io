import { absoluteUrl, escapeXml, SITE, toIsoDate } from "../lib/site.js";
import { getBlogPosts } from "../lib/posts.js";

export async function GET() {
  const posts = await getBlogPosts();
  const updatedDate = posts[0]?.modifiedDate || posts[0]?.date || new Date().toISOString();
  const items = posts.map((post) => {
    const authors = (Array.isArray(post.authors) ? post.authors : [post.authors]).filter(Boolean);

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${authors.map((author) => `<dc:creator>${escapeXml(author)}</dc:creator>`).join("\n      ")}
    </item>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${escapeXml(absoluteUrl("/blogs/"))}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date(updatedDate).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
