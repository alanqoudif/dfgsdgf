'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/app/language-context';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { translate, direction } = useLanguage();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !name) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'يرجى إكمال جميع الحقول المطلوبة',
          'Please complete all required fields'
        ),
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'كلمات المرور غير متطابقة',
          'Passwords do not match'
        ),
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
          'Password must be at least 6 characters long'
        ),
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { user, error } = await signUp(email, password, name);
      
      if (error) {
        toast({
          title: translate('فشل التسجيل', 'Registration Failed'),
          description: error.message,
          variant: 'destructive',
        });
      } else if (user) {
        toast({
          title: translate('تم التسجيل بنجاح', 'Registration Successful'),
          description: translate(
            'تم إنشاء حسابك بنجاح!',
            'Your account has been created successfully!'
          ),
        });
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
          'An unexpected error occurred. Please try again'
        ),
        variant: 'destructive',
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
            {translate('إنشاء حساب', 'Create an account')}
          </CardTitle>
          <CardDescription>
            {translate(
              'أدخل بياناتك لإنشاء حساب جديد',
              'Enter your information to create a new account'
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {translate('الاسم', 'Name')}
              </Label>
              <Input
                id="name"
                placeholder={translate('أدخل اسمك', 'Enter your name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
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
              <Label htmlFor="password">
                {translate('كلمة المرور', 'Password')}
              </Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {translate('تأكيد كلمة المرور', 'Confirm Password')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={translate('أعد إدخال كلمة المرور', 'Re-enter your password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                ? translate('جاري التسجيل...', 'Signing up...') 
                : translate('تسجيل', 'Sign up')
              }
            </Button>
            <div className="text-center text-sm">
              {translate('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
              <Link 
                href="/login" 
                className="text-primary hover:underline"
              >
                {translate('تسجيل الدخول', 'Sign in')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 