import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://etf-look-through-frontend.vercel.app';

  // 기본적으로 노출되어야 하는 경로들
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1, // 메인 페이지이므로 가장 높은 우선순위
    },
    {
      url: `${baseUrl}/etf`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // 만약 나중에 블로그나 ETF 목록 등 동적 페이지가 많아지면 
  // 여기에서 데이터를 fetching하여 routes 배열에 추가하면 됩니다.

  return routes;
}