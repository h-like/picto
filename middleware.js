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

  if(req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.startsWith('/trpc')){
    return NextResponse.next();
  }

  if(!userId && isProtectedRoutes(req)){
    return (await auth()).redirectToSignIn();
  }

  return intlMiddleware(req);
})

export const config = {
  matcher: [
    // 정적 파일 제외
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API 경로도 반드시 Matcher에 "포함"되어야 Clerk이 작동
    '/(api|trpc)(.*)',
  ],
}