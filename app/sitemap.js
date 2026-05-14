import { blogPosts } from "./utils/blogPosts.js";

const siteUrl = "https://paigowlab.com";

export default function sitemap() {
  const now = new Date();
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogRoutes = blogPosts.map((post) => ({
    url: `${siteUrl}${post.href}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: post.category === "Pai Gow" ? 0.7 : 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
