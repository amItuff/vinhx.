import { NextResponse } from 'next/server';

export function middleware(request) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const acceptHeader = (request.headers.get('accept') || '').toLowerCase();

  // Danh sách User-Agent của bot cào, tool inspect mã nguồn và thư viện HTTP
  const BOT_SIGNATURES = [
    'bot',
    'crawl',
    'spider',
    'slurp',
    'curl',
    'wget',
    'python',
    'axios',
    'node-fetch',
    'httpclient',
    'view-page-source',
    'headlesschrome',
    'phantomjs',
    'selenium',
    'puppeteer'
  ];

  // Kiểm tra nếu request không phải từ trình duyệt thông thường hoặc nằm trong danh sách bot
  const isBot = BOT_SIGNATURES.some(sig => userAgent.includes(sig));
  const isNotBrowser = !userAgent.includes('mozilla') || !acceptHeader.includes('text/html');

  if (isBot || isNotBrowser) {
    // Trả về thẳng chuỗi text bạn muốn
    return new NextResponse('fucking stupid steal vinhx code', {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate'
      }
    });
  }

  return NextResponse.next();
}

// Cấu hình áp dụng cho trang chủ và file HTML chính
export const config = {
  matcher: ['/', '/index.html']
};
