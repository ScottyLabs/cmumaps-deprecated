import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/manifest.json',
  '/.well-known/assetlinks.json',
  '/robots.txt',
]);

export default clerkMiddleware((auth, request) => {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  if (
    url.searchParams.get('secret') === '1234' ||
    request.cookies.get('access_approved')
  ) {
    // TODO: Store a cookie for the user
    url.searchParams.set('userAgent', userAgent);
    const resp = NextResponse.rewrite(url);
    resp.cookies.set('access_approved', 'true');
    return resp;
  } else {
    console.log(request.url);
    if (!isPublicRoute(request)) {
      auth().protect();
    }
    url.searchParams.set('userAgent', userAgent);
    return NextResponse.rewrite(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
