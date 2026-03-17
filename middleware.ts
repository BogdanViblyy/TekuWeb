// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication (without locale prefix)
const protectedPaths = ['/profile', '/profile/orders', '/profile/wishlist'];

// Routes that should redirect home if already authenticated
const authPaths = ['/auth/login', '/auth/register'];

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    return new TextEncoder().encode(secret);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get('session_token')?.value;
    if (!token) return false;

    try {
        const secret = getJwtSecret();
        await jwtVerify(token, secret);
        return true;
    } catch {
        return false;
    }
}

function stripLocalePrefix(pathname: string): string {
    for (const locale of routing.locales) {
        if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
            return pathname.slice(`/${locale}`.length) || '/';
        }
    }
    return pathname;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const pathWithoutLocale = stripLocalePrefix(pathname);

    // Check if the current path matches a protected route
    const isProtectedRoute = protectedPaths.some(
        (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
    );

    // Check if the current path is an auth route
    const isAuthRoute = authPaths.some(
        (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
    );

    if (isProtectedRoute) {
        const authenticated = await isAuthenticated(request);
        if (!authenticated) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathWithoutLocale);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (isAuthRoute) {
        const authenticated = await isAuthenticated(request);
        if (authenticated) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Run next-intl middleware for locale detection and routing
    return intlMiddleware(request);
}

export const config = {
    matcher: [
        // Match all pathnames except for:
        // - /api (API routes)
        // - /_next (Next internals)  
        // - /images, /fonts, /_vercel (static files)
        // - Files with extensions (.ico, .png, etc.)
        '/((?!api|_next|images|fonts|_vercel|.*\\..*).*)',
    ],
};
