import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserCircle } from '@phosphor-icons/react';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage() {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect if user is already logged in
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded-full">
            <UserCircle size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          تسجيل الدخول
        </h1>
        
        <LoginForm />
        
        <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          ليس لديك حساب؟{' '}
          <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
            إنشاء حساب
          </Link>
        </div>
      </div>
    </main>
  );
} 