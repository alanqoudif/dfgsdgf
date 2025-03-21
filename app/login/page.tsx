'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/app/language-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { translate, direction } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error({
        title: translate('خطأ', 'Error'),
        description: translate(
          'يرجى إدخال البريد الإلكتروني وكلمة المرور',
          'Please enter your email and password'
        ),
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { user, error } = await signIn(email, password);
      
      if (error) {
        toast.error({
          title: translate('فشل تسجيل الدخول', 'Login Failed'),
          description: error.message,
        });
      } else if (user) {
        toast.success({
          title: translate('تم تسجيل الدخول بنجاح', 'Login Successful'),
          description: translate(
            'مرحبًا بعودتك!',
            'Welcome back!'
          ),
        });
        
        // Redirect to home page after successful login
        router.push('/');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error({
        title: translate('خطأ', 'Error'),
        description: translate(
          'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى',
          'An error occurred during login, please try again'
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" dir={direction}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {translate('تسجيل الدخول', 'Sign In')}
          </CardTitle>
          <CardDescription>
            {translate(
              'أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول إلى حسابك',
              'Enter your email and password to sign in to your account'
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {translate('البريد الإلكتروني', 'Email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={translate('أدخل بريدك الإلكتروني', 'Enter your email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  {translate('كلمة المرور', 'Password')}
                </Label>
                <Link 
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {translate('نسيت كلمة المرور؟', 'Forgot password?')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={translate('أدخل كلمة المرور', 'Enter your password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading 
                ? translate('جاري تسجيل الدخول...', 'Signing in...') 
                : translate('تسجيل الدخول', 'Sign in')
              }
            </Button>
            <div className="text-center text-sm">
              {translate('ليس لديك حساب؟', "Don't have an account?")}{' '}
              <Link 
                href="/register" 
                className="text-primary hover:underline"
              >
                {translate('سجل الآن', 'Sign up')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 