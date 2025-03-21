import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { CommandMenu } from '@/components/command-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/app/language-context';
import { UserButton } from '@/components/UserButton';
import { useQuestionLimit } from '@/hooks/useQuestionLimit';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { translate } = useLanguage();
  const { questionsLeft, isAnonymous, isLoading } = useQuestionLimit();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" passHref>
            <div className="mr-6 flex items-center space-x-2">
              <Image alt="logo" src="/logo.png" width={32} height={32} />
              <span className="hidden font-bold sm:inline-block">Lory</span>
            </div>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === '/'
                  ? 'text-foreground'
                  : 'text-foreground/60'
              )}
            >
              {translate('الرئيسية', 'Home')}
            </Link>
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link href="/" passHref>
                <div className="flex items-center">
                  <Image alt="logo" src="/logo.png" width={32} height={32} />
                  <span className="ml-2 font-bold">Lory</span>
                </div>
              </Link>
            </div>
            <div className="flex flex-col space-y-3 p-7">
              <Link
                href="/"
                className={cn(
                  'text-sm transition-colors hover:text-foreground/80',
                  pathname === '/'
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {translate('الرئيسية', 'Home')}
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu />
          </div>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="relative mr-2 gap-2 text-sm h-8 px-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    {!isLoading && questionsLeft !== null && (
                      <span className="font-medium">
                        {questionsLeft} 
                      </span>
                    )}
                    {!isLoading && questionsLeft === null && (
                      <span className="font-medium">
                        ∞
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  <div className="p-2">
                    <h4 className="font-bold text-sm mb-1">
                      {translate('رصيد الرسائل:', 'Message Balance:')} {questionsLeft !== null ? questionsLeft : '∞'}
                    </h4>
                    {questionsLeft !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {translate(
                          isAnonymous 
                            ? 'الحد الأقصى للزوار: 3 رسائل'
                            : 'الحد الأقصى للمستخدمين: 25 رسالة',
                          isAnonymous
                            ? 'Guest limit: 3 messages'
                            : 'User limit: 25 messages'
                        )}
                      </p>
                    )}
                    {isAnonymous && (
                      <div className="mt-3 pt-2 border-t flex flex-col gap-2">
                        <p className="text-xs font-medium">
                          {translate(
                            'قم بتسجيل الدخول للحصول على المزيد من الرسائل',
                            'Sign in to get more messages'
                          )}
                        </p>
                        <div className="flex gap-2">
                          <Link 
                            href="/login" 
                            className="text-xs flex-1 text-center px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            {translate('تسجيل الدخول', 'Sign In')}
                          </Link>
                          <Link 
                            href="/register" 
                            className="text-xs flex-1 text-center px-2 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            {translate('إنشاء حساب', 'Sign Up')}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <LanguageToggle />
            <ModeToggle />
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 