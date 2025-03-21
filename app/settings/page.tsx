'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, updateProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/app/language-context';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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
        setName(currentUser.user_metadata?.name || '');
        
        // Load preferences from localStorage if available
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications !== null) {
          setNotifications(savedNotifications === 'true');
        }
        
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
          setDarkMode(savedDarkMode === 'true');
        }
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

  const handleProfileUpdate = async () => {
    if (!name.trim()) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'الرجاء إدخال اسم صالح',
          'Please enter a valid name'
        ),
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const { user: updatedUser, error } = await updateProfile({
        name: name.trim(),
      });
      
      if (error) {
        toast({
          title: translate('خطأ', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setUser(updatedUser);
        toast({
          title: translate('تم التحديث', 'Updated'),
          description: translate(
            'تم تحديث الملف الشخصي بنجاح',
            'Profile updated successfully'
          ),
        });
      }
    } catch (error) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'حدث خطأ أثناء تحديث الملف الشخصي',
          'Error updating profile'
        ),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = () => {
    try {
      localStorage.setItem('notifications', notifications.toString());
      localStorage.setItem('darkMode', darkMode.toString());
      
      toast({
        title: translate('تم التحديث', 'Updated'),
        description: translate(
          'تم تحديث التفضيلات بنجاح',
          'Preferences updated successfully'
        ),
      });
    } catch (error) {
      toast({
        title: translate('خطأ', 'Error'),
        description: translate(
          'حدث خطأ أثناء تحديث التفضيلات',
          'Error updating preferences'
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
      <h1 className="text-3xl font-bold mb-6">
        {translate('الإعدادات', 'Settings')}
      </h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            {translate('الملف الشخصي', 'Profile')}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            {translate('التفضيلات', 'Preferences')}
          </TabsTrigger>
          <TabsTrigger value="account">
            {translate('الحساب', 'Account')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>
                {translate('معلومات الملف الشخصي', 'Profile Information')}
              </CardTitle>
              <CardDescription>
                {translate(
                  'تحديث معلومات ملفك الشخصي',
                  'Update your profile information'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {translate('البريد الإلكتروني', 'Email')}
                </Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {translate(
                    'لا يمكن تغيير البريد الإلكتروني',
                    'Email cannot be changed'
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">
                  {translate('الاسم', 'Name')}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>
              
              <Button 
                onClick={handleProfileUpdate} 
                disabled={saving}
              >
                {saving 
                  ? translate('جاري الحفظ...', 'Saving...') 
                  : translate('حفظ التغييرات', 'Save Changes')
                }
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>
                {translate('تفضيلات التطبيق', 'App Preferences')}
              </CardTitle>
              <CardDescription>
                {translate(
                  'تخصيص كيفية ظهور التطبيق وعمله',
                  'Customize how the app appears and functions'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {translate('الإشعارات', 'Notifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {translate(
                      'تلقي إشعارات عن العمليات المهمة',
                      'Receive notifications about important operations'
                    )}
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {translate('الوضع المظلم', 'Dark Mode')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {translate(
                      'تبديل مظهر التطبيق بين الوضع الفاتح والمظلم',
                      'Toggle the app appearance between light and dark'
                    )}
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <Button onClick={handlePreferencesUpdate}>
                {translate('حفظ التفضيلات', 'Save Preferences')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>
                {translate('إعدادات الحساب', 'Account Settings')}
              </CardTitle>
              <CardDescription>
                {translate(
                  'إدارة إعدادات حسابك والاشتراك',
                  'Manage your account settings and subscription'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {translate('حالة الاشتراك', 'Subscription Status')}
                </h3>
                <div className="rounded-md bg-muted p-4">
                  <div className="font-medium">
                    {translate('الخطة الحالية:', 'Current Plan:')} {' '}
                    <span className="font-bold text-primary">
                      {translate('مجاني', 'Free')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {translate(
                      'يمكنك طرح 20 سؤالاً في اليوم',
                      'You can ask 20 questions per day'
                    )}
                  </p>
                </div>
                
                <Button variant="outline">
                  {translate('ترقية إلى الخطة المميزة', 'Upgrade to Premium')}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {translate('كلمة المرور والأمان', 'Password & Security')}
                </h3>
                <Button variant="outline">
                  {translate('تغيير كلمة المرور', 'Change Password')}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">
                  {translate('إجراءات خطيرة', 'Danger Zone')}
                </h3>
                <Button variant="destructive">
                  {translate('حذف الحساب', 'Delete Account')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 