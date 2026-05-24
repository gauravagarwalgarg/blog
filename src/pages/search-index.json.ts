import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');

  const searchIndex = posts
    .filter(post => !post.data.draft)
    .map(post => ({
      title: post.data.title,
      description: post.data.description,
      slug: post.id,
      category: post.data.category,
      tags: post.data.tags,
      pubDate: post.data.pubDate.toISOString(),
    }));

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' },
  });
};
