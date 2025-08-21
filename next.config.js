/** @type {import('next').NextConfig} */
const nextConfig = {
  // 성능 최적화 설정
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // API 라우트 설정 - 파일 업로드 크기 제한
  api: {
    bodyParser: {
      sizeLimit: '20mb', // 20MB로 설정
    },
    responseLimit: '20mb',
  },
  
  webpack: (config, { isServer }) => {
    // PDF.js 관련 경고 무시
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
      { module: /node_modules\/react-pdf/ },
      { module: /node_modules\/pdfjs-dist/ }
    ]
    
    // 번들 크기 최적화
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    
    return config
  }
}

module.exports = nextConfig
