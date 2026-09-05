import { MetadataRoute } from 'next';
import { TOOLS_REGISTRY } from '@/lib/tools/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://toolora.com';
  const now = new Date();

  const staticPages = [
    '',
    '/tools',
    '/pricing',
    '/charity',
    '/support',
    '/blog',
    '/about',
    '/contact',
    '/request-tool',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const toolPages = TOOLS_REGISTRY.map((tool) => ({
    url: `${baseUrl}/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: tool.popular ? 0.9 : 0.7,
  }));

  return [...staticPages, ...toolPages];
}
