import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to handle authentication and redirection
 * This is server-side code and needs its own Supabase client instance
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // This is a special server-side client that needs to be created this way
  // We can't use our singleton pattern here because this runs in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // التحقق من المصادقة للمسارات المقيدة
  const { data: { session } } = await supabase.auth.getSession();

  // إذا كان المسار هو /profile أو /settings وليس هناك جلسة، قم بإعادة التوجيه إلى صفحة تسجيل الدخول
  if ((request.nextUrl.pathname.startsWith('/profile') || 
      request.nextUrl.pathname.startsWith('/settings')) && 
      !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // تحديث رأس الاستجابة بمعلومات المستخدم
  if (session) {
    response.headers.set('x-user-id', session.user.id);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)'],
}; 