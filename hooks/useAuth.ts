import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// تعريف نوع لبيانات تسجيل المستخدم
interface SignUpData {
  email: string;
  password: string;
  options?: {
    data?: {
      name?: string;
      user_type?: string;
      university?: string | null;
      college?: string | null;
    }
  }
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const router = useRouter();

  // Get session and user on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.refresh();
      toast.success('تم تسجيل الدخول بنجاح');
      return { success: true };
    } catch (error: any) {
      toast.error('فشل تسجيل الدخول: ' + error.message);
      return { success: false, error };
    }
  }, [supabase, router]);

  // Sign up with email and password
  const signUp = useCallback(async (data: SignUpData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: data.options
      });
      
      if (error) throw error;
      toast.success('تم إنشاء الحساب بنجاح. تحقق من بريدك الإلكتروني للتأكيد.');
      return { success: true };
    } catch (error: any) {
      toast.error('فشل إنشاء الحساب: ' + error.message);
      return { success: false, error };
    }
  }, [supabase]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      toast.error('فشل تسجيل الخروج: ' + error.message);
    }
  }, [supabase]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      return { success: true };
    } catch (error: any) {
      toast.error('فشل إرسال رابط إعادة تعيين كلمة المرور: ' + error.message);
      return { success: false, error };
    }
  }, [supabase]);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
} 