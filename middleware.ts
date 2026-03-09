// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require authentication
const protectedRoutes = ['/profile', '/profile/orders'];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/auth/login', '/auth/register'];

// Encode the secret once
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

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current path matches a protected route
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );

    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );

    if (isProtectedRoute) {
        const authenticated = await isAuthenticated(request);
        if (!authenticated) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (isAuthRoute) {
        const authenticated = await isAuthenticated(request);
        if (authenticated) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match protected and auth routes
        '/profile/:path*',
        '/auth/:path*',
    ],
};
