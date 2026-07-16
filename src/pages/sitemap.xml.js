import { absoluteUrl, escapeXml, toIsoDate } from "../lib/site.js";
import { getBlogPosts } from "../lib/posts.js";

export async function GET() {
  const posts = await getBlogPosts();
  const newestPostDate = posts[0]?.modifiedDate || posts[0]?.date || new Date().toISOString();
  const pages = [
    {
      loc: absoluteUrl("/blogs/"),
      lastmod: toIsoDate(newestPostDate),
      changefreq: "weekly",
      priority: "0.9"
    },
    ...posts.map((post) => ({
      loc: post.url,
      lastmod: toIsoDate(post.modifiedDate || post.date),
      changefreq: "monthly",
      priority: "0.7"
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
