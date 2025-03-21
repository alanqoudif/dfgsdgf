import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkUserLimit, FREE_TIER_QUESTIONS_LIMIT } from '@/lib/supabase';

// Anonymous users can only ask 3 questions
const ANONYMOUS_QUESTION_LIMIT = 3;

export async function POST(request: Request) {
  try {
    // المحاولة لقراءة البيانات مع معالجة أفضل للأخطاء
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('خطأ في قراءة البيانات:', e);
      body = {};
    }
    
    const { anonymousCount = 0 } = body;
    
    // إنشاء عميل Supabase مع معالجة استثناءات
    let supabase;
    try {
      supabase = createRouteHandlerClient({ cookies });
    } catch (e) {
      console.error('خطأ في إنشاء عميل Supabase:', e);
      // إذا فشل إنشاء العميل، نعود إلى التحقق من المستخدم المجهول
      return NextResponse.json({
        isAnonymous: true,
        hasReachedLimit: anonymousCount >= ANONYMOUS_QUESTION_LIMIT,
        questionsLeft: Math.max(0, ANONYMOUS_QUESTION_LIMIT - anonymousCount),
        daysToReset: null,
      });
    }
    
    // التحقق من جلسة المستخدم مع معالجة الأخطاء
    let session;
    try {
      const sessionResult = await supabase.auth.getSession();
      session = sessionResult.data.session;
    } catch (e) {
      console.error('خطأ في الحصول على جلسة المستخدم:', e);
      // في حالة فشل الحصول على الجلسة، نعود إلى التحقق من المستخدم المجهول
      return NextResponse.json({
        isAnonymous: true,
        hasReachedLimit: anonymousCount >= ANONYMOUS_QUESTION_LIMIT,
        questionsLeft: Math.max(0, ANONYMOUS_QUESTION_LIMIT - anonymousCount),
        daysToReset: null,
      });
    }
    
    if (session?.user) {
      // المستخدم مسجل - التحقق من الحد في قاعدة البيانات
      const userId = session.user.id;
      
      try {
        const { hasReachedLimit, questionsLeft, daysToReset, error } = await checkUserLimit(userId);
        
        if (error) {
          console.error('خطأ في التحقق من حد المستخدم:', error);
          return NextResponse.json({ error: 'خطأ في التحقق من الحد' }, { status: 500 });
        }
        
        return NextResponse.json({
          isAnonymous: false,
          hasReachedLimit,
          questionsLeft,
          daysToReset,
        });
      } catch (e) {
        console.error('خطأ في التحقق من حد المستخدم:', e);
        return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 });
      }
    } else {
      // مستخدم مجهول - التحقق من عداد localStorage المرسل من العميل
      const count = anonymousCount || 0;
      const questionsLeft = Math.max(0, ANONYMOUS_QUESTION_LIMIT - count);
      
      return NextResponse.json({
        isAnonymous: true,
        hasReachedLimit: questionsLeft <= 0,
        questionsLeft,
        daysToReset: null,
      });
    }
    
  } catch (error) {
    console.error('خطأ في API check-limit:', error);
    
    // في حالة حدوث خطأ غير متوقع، نسمح للمستخدم بالاستمرار
    return NextResponse.json({
      isAnonymous: true,
      hasReachedLimit: false,
      questionsLeft: ANONYMOUS_QUESTION_LIMIT,
      daysToReset: null,
      error: 'حدث خطأ غير متوقع'
    }, { status: 200 }); // نعيد 200 بدلاً من 500 لتجنب توقف واجهة المستخدم
  }
} 