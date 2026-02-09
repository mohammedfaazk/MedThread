import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
                setAll: (cookies) => {
                    cookies.forEach((c) => res.cookies.set(c.name, c.value, c.options));
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // If session exists, allow access
    if (session) {
        return res;
    }

    // If no session and trying to access protected paths (root or others)
    const url = req.nextUrl.clone();

    // Exclude login page and public assets from redirect
    if (
        url.pathname === '/login' ||
        url.pathname === '/signup' ||
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.includes('.')
    ) {
        return res;
    }

    // Redirect to login
    url.pathname = '/login';
    return NextResponse.redirect(url);
}

// Ensure middleware runs for the dashboard shell paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
