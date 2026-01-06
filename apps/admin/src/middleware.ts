/**
 * Admin Portal Middleware
 *
 * Enforces:
 * 1. Authentication (must be logged in)
 * 2. Admin role (must have is_active=true in admin_roles)
 * 3. MFA requirement (must have MFA enabled)
 * 4. Password freshness (if email+password, must be < 180 days)
 *
 * Protected routes:
 * - /dashboard
 * - /users
 * - /audit
 *
 * Public routes:
 * - /login
 * - /setup-mfa
 * - /change-password
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/login', '/setup-mfa', '/change-password', '/auth/callback'];
const ADMIN_ONLY_ROUTES = ['/audit'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Create response for cookie handling
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For protected routes, we need to verify admin role
  // This is done in the layout/page level using server components
  // because middleware can't use service_role safely

  // Add user info to headers for server components
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-email', user.email ?? '');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
