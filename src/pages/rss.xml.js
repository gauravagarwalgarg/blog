import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_AUTHOR } from '../consts';

export async function GET(context) {
	const posts = (await getCollection('blog'))
		.filter(p => !p.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		language: 'en-us',
		managingEditor: `gauravagarwalgarg@gmail.com (${SITE_AUTHOR})`,
		webMaster: `gauravagarwalgarg@gmail.com (${SITE_AUTHOR})`,
		copyright: `Copyright ${new Date().getFullYear()} ${SITE_AUTHOR}`,
		lastBuildDate: new Date(),
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/posts/${post.id}/`,
			categories: [post.data.category, ...(post.data.tags || [])],
			author: `gauravagarwalgarg@gmail.com (${SITE_AUTHOR})`,
		})),
		customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>`,
	});
}
