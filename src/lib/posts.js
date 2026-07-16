import { blogPath, blogUrl } from "./site.js";

const postImports = import.meta.glob("../content/blog/*.mdx");

export async function getBlogPostEntries() {
  const posts = await Promise.all(
    Object.entries(postImports).map(async ([path, loadPost]) => {
      const post = await loadPost();
      const fileSlug = path.split("/").pop()?.replace(/\.mdx?$/, "");
      const slug = post.frontmatter.slug || fileSlug;

      return {
        module: post,
        slug,
        path: blogPath(slug),
        url: blogUrl(slug),
        ...post.frontmatter
      };
    })
  );

  return posts.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
}

export async function getBlogPosts() {
  return (await getBlogPostEntries()).map(({ module, ...post }) => post);
}
