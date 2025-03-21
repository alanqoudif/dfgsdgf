'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut, getCurrentUser } from '@/lib/auth';
import { getUserQuestions } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/app/language-context';

type Question = {
  id: string;
  question: string;
  answer: string;
  created_at: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { translate, direction } = useLanguage();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        const userQuestions = await getUserQuestions(currentUser.id);
        setQuestions(userQuestions);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: translate('خطأ', 'Error'),
          description: translate(
            'حدث خطأ أثناء تحميل بيانات المستخدم',
            'Error loading user data'
          ),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [router, toast, translate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
      toast({
        title: translate('تم تسجيل الخروج', 'Logged Out'),
        description: translate(
          'تم تسجيل خروجك بنجاح',
          'You have been successfully logged out'
        ),
      });
    } catch (error) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'حدث خطأ أثناء تسجيل الخروج',
          'Error logging out'
        ),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-t-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" dir={direction}>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {translate('الملف الشخصي', 'Profile')}
          </CardTitle>
          <CardDescription>
            {translate('مرحبا', 'Welcome')}, {user?.user_metadata?.name || user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {translate('البريد الإلكتروني', 'Email')}: {user?.email}
              </p>
              {user?.user_metadata?.name && (
                <p className="text-sm text-muted-foreground">
                  {translate('الاسم', 'Name')}: {user.user_metadata.name}
                </p>
              )}
            </div>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
            >
              {translate('تسجيل الخروج', 'Sign Out')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {translate('سجل الأسئلة', 'Question History')}
          </CardTitle>
          <CardDescription>
            {translate(
              'عرض جميع الأسئلة التي قمت بطرحها سابقًا',
              'View all the questions you have asked before'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {translate(
                'لم تقم بطرح أي أسئلة حتى الآن',
                'You have not asked any questions yet'
              )}
            </p>
          ) : (
            <div className="space-y-6">
              {questions.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">{item.question}</p>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 