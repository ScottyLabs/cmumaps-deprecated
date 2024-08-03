import { authMiddleware } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';

// See https://clerk.com/docs/references/nextjs/auth-middleware
// for more information about configuring your Middleware

export default authMiddleware({
  // Allow signed out users to access the specified routes:
  //   publicRoutes: ['/'],
  // Prevent the specified routes from accessing
  // authentication information:
  //   ignoredRoutes: ['/GHC-5'],
});

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, which are Next.js internals.

    '/((?!.+\\.[\\w]+$|_next).*)',
    // Re-include any files in the api or trpc folders that might have an extension
    '/(api|trpc)(.*)',
  ],
};

// for detecting the type of device
export const middleware = (request: NextRequest) => {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  url.searchParams.set('userAgent', userAgent);

  return NextResponse.rewrite(url);
};
