import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 백엔드 API 프록시 (선택사항 - CORS 허용 시 직접 호출 가능)
  // rewrites: async () => [
  //   { source: "/api/:path*", destination: "http://localhost:8000/api/:path*" },
  // ],
};

export default nextConfig;
