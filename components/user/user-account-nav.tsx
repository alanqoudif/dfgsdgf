"use client"

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, LogOut, User2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '../auth/auth-dialog';
import { useQuestionLimits } from '@/hooks/useQuestionLimits';

export function UserAccountNav() {
  const { user, signOut } = useAuth();
  const { questionsCount, isPaidUser, getRemainingQuestions } = useQuestionLimits();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  const remainingQuestions = getRemainingQuestions();

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative rounded-full">
              <User2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-right">حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-between">
              <span>{questionsCount}</span>
              <span>عدد الأسئلة المستخدمة</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between">
              <span>{isPaidUser ? 'غير محدود' : remainingQuestions}</span>
              <span>الأسئلة المتبقية</span>
            </DropdownMenuItem>
            {!isPaidUser && remainingQuestions === 0 && (
              <DropdownMenuItem className="text-right text-destructive">
                لقد وصلت إلى الحد الأقصى للأسئلة المجانية
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {!isPaidUser && (
              <DropdownMenuItem className="text-right">
                ترقية إلى خطة مدفوعة
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-right text-destructive focus:text-destructive"
              disabled={isSigningOut}
              onClick={handleSignOut}
            >
              {isSigningOut ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <LogOut className="h-4 w-4 ml-2" />}
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}>
          <LogIn className="h-4 w-4 mr-2" />
          <span>تسجيل الدخول</span>
        </Button>
      )}
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </>
  );
} 