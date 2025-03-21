'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCurrentUser, signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { User, LogOut, Settings, History } from 'lucide-react';
import { useLanguage } from '@/app/language-context';

export function UserButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { translate, direction } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

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
      <Button size="icon" variant="ghost" disabled className="rounded-full">
        <div className="w-5 h-5 rounded-full animate-pulse bg-muted"></div>
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild variant="default" size="sm" className="gap-2">
        <Link href="/login">
          <User className="h-4 w-4" />
          {translate('تسجيل الدخول', 'Sign In')}
        </Link>
      </Button>
    );
  }

  const initials = user.user_metadata?.name
    ? user.user_metadata.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium">
              {user.user_metadata?.name || translate('المستخدم', 'User')}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex w-full items-center">
            <User className="mr-2 h-4 w-4" />
            {translate('الملف الشخصي', 'Profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer flex w-full items-center">
            <Settings className="mr-2 h-4 w-4" />
            {translate('الإعدادات', 'Settings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex w-full items-center">
            <History className="mr-2 h-4 w-4" />
            {translate('سجل الأسئلة', 'Question History')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-500 focus:text-red-500"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {translate('تسجيل الخروج', 'Sign Out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 