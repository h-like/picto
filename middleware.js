import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ko'], // 지원할 언어
  defaultLocale: 'ko'     // 기본 언어
});

const isProtectedRoutes = createRouteMatcher(["/dashboard(.*)", "/editor(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if(!userId && isProtectedRoutes(req)){
    // const { redirectToSignIn } = await auth()

    // return redirectToSignIn()
    return (await auth()).redirectToSignIn();
  }

  return intlMiddleware(req);
  // return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}