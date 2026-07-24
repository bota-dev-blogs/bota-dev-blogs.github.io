const siteUrl = (process.env.SITE_URL || "https://bota-dev-blogs.github.io").replace(/\/$/, "");

export const SITE = {
  name: "Bota Blog",
  shortName: "Bota",
  url: siteUrl,
  locale: "en_US",
  description: "Insights, updates, and thought leadership on conversation intelligence, AI wearables, and the future of in-person communication technology.",
  defaultImage: "https://framerusercontent.com/images/opUMlnDE0MfK2xaK6asGmcfPpj8.png?width=1200&height=800"
};

export function absoluteUrl(path = "/") {
  if (!path) return SITE.url;
  if (/^https?:\/\//i.test(path)) return path;

  return new URL(path.startsWith("/") ? path : `/${path}`, SITE.url).toString();
}

export function blogPath(slug) {
  return `/blogs/${slug}/`;
}

export function blogUrl(slug) {
  return absoluteUrl(blogPath(slug));
}

export function formatDisplayDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export function toIsoDate(date) {
  return new Date(date).toISOString();
}

export function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
