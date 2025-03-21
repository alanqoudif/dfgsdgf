import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * معالجة رمز المصادقة من Supabase
 * يستخدم هذا المسار عندما يتم إعادة توجيه المستخدم بعد تأكيد البريد الإلكتروني
 */
export async function GET(request: NextRequest) {
  // استخراج الرمز من عنوان URL
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // تبادل الرمز للحصول على جلسة
    await supabase.auth.exchangeCodeForSession(code);
  }

  // إعادة توجيه المستخدم إلى الصفحة الرئيسية
  return NextResponse.redirect(new URL('/', request.url));
} 