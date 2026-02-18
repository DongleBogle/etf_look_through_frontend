import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',      // 모든 검색 로봇에게 허용
      allow: '/',          // 모든 페이지 수집 허용
      disallow: '/private/', // (선택) 숨기고 싶은 페이지가 있다면 추가
    },
    sitemap: 'https://etf-look-through-frontend.vercel.app/sitemap.xml', // 사이트맵 위치 알려주기
  }
}