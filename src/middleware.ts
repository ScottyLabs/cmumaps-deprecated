import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/manifest.json',
  '/.well-known/assetlinks.json',
  '/robots.txt',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const referrer = request.headers.get('referer');

  url.searchParams.set('userAgent', userAgent);

  const response = NextResponse.rewrite(url);

  if (!referrer || !referrer.startsWith('scottycon-guide.com')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
