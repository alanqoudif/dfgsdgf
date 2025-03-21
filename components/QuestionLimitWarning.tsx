import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useLanguage } from '@/app/language-context';
import { customContent } from '@/data/custom-content';

interface QuestionLimitWarningProps {
  questionsLeft: number | null;
  daysToReset: number | null;
  isPaidUser?: boolean;
}

export function QuestionLimitWarning({ questionsLeft, daysToReset, isPaidUser = false }: QuestionLimitWarningProps) {
  const { translate } = useLanguage();
  
  // Don't show for paid users
  if (isPaidUser) {
    return null;
  }
  
  // Don't show if there's no limit info available
  if (questionsLeft === null) {
    return null;
  }
  
  // Show different warnings based on questions left
  if (questionsLeft <= 5) {
    // Format the warning message with variables
    const warningMessage = translate(
      customContent.messages.limitWarning.ar,
      customContent.messages.limitWarning.en
    )
      .replace('{count}', String(questionsLeft))
      .replace('{days}', daysToReset !== null ? String(daysToReset) : 'null');
    
    return (
      <Alert variant="warning" className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>
          {translate("تنبيه!", "Warning!")}
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{warningMessage}</p>
          <Link href="/login" passHref>
            <Button variant="outline" size="sm">
              {translate("سجل دخول للمزيد من الأسئلة", "Sign in for more questions")}
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  // No warning needed for users with plenty of questions left
  return null;
} 