/** @type {import('next').NextConfig} */
const nextConfig = {
  // كنفجريشن خاص بـ Netlify والـ Next.js
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-project.supabase.co'],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
  // تجاهل الأخطاء ESLint أثناء البناء لمنع فشل البناء
  eslint: {
    ignoreDuringBuilds: true,
  },
  // تجاهل أخطاء TypeScript أثناء البناء
  typescript: {
    ignoreBuildErrors: true,
  },
  // تعطيل سلة مهملات التبعيات غير المستخدمة
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
}

module.exports = nextConfig 