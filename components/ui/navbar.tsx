import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { CommandMenu } from '@/components/command-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/app/language-context';
import { UserButton } from '@/components/UserButton';

export function Navbar() {
  const pathname = usePathname();
  const { translate } = useLanguage();

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
            <LanguageToggle />
            <ModeToggle />
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 