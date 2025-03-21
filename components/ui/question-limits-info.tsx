import { useAuth } from '@/hooks/useAuth';
import { useQuestionLimits } from '@/hooks/useQuestionLimits';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from './button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './tooltip';
import { InfoIcon, AlertCircle } from 'lucide-react';
import { AuthDialog } from '../auth/auth-dialog';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function QuestionLimitsInfo() {
  const { user } = useAuth();
  const { 
    questionsCount, 
    isLoading, 
    isPaidUser, 
    getRemainingQuestions, 
    getTimeUntilReset,
    canAskMoreQuestions
  } = useQuestionLimits();
  const { translate } = useLanguage();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const remainingQuestions = getRemainingQuestions();
  const daysUntilReset = getTimeUntilReset() || 3; // استخدم القيمة الافتراضية 3 إذا كانت القيمة null
  
  // إظهار إشعار عندما يكون المستخدم قريبًا من الوصول للحد الأقصى
  useEffect(() => {
    // إذا كان المستخدم مدفوع لا نظهر أي إشعار
    if (isPaidUser) return;
    
    // إذا لم تكتمل البيانات بعد، ننتظر
    if (isLoading) return;
    
    // عند وصول المستخدم المسجل إلى حد 3 أسئلة متبقية
    if (user && remainingQuestions === 3) {
      toast.warning(
        translate(
          "تبقى لديك 3 أسئلة فقط من إجمالي 25 سؤال. سيتم تجديد رصيدك بعد " + 
            (daysUntilReset === 1 ? "يوم واحد" : daysUntilReset + " أيام") + ".",
          "You have only 3 questions left out of 25. Your balance will be renewed after " + 
            (daysUntilReset === 1 ? "1 day" : daysUntilReset + " days") + "."
        ),
        {
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 5000
        }
      );
    }
    
    // عند وصول الزائر إلى سؤال واحد متبقي
    if (!user && remainingQuestions === 1) {
      toast.warning(
        translate(
          "تبقى لديك سؤال واحد فقط كزائر. قم بتسجيل الدخول للحصول على 25 سؤال كل 3 أيام.",
          "You have only 1 question left as a guest. Sign in to get 25 questions every 3 days."
        ),
        {
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 5000
        }
      );
    }
    
    // عند وصول المستخدم للحد الأقصى (لا يمكن طرح المزيد من الأسئلة)
    if (!canAskMoreQuestions()) {
      if (user) {
        toast.error(
          translate(
            "لقد وصلت إلى الحد الأقصى للأسئلة. سيتم تجديد رصيدك بعد " + 
              (daysUntilReset === 1 ? "يوم واحد" : daysUntilReset + " أيام") + ".",
            "You have reached the maximum limit of questions. Your balance will be renewed after " + 
              (daysUntilReset === 1 ? "1 day" : daysUntilReset + " days") + "."
          ),
          {
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 5000
          }
        );
      } else {
        toast.error(
          translate(
            "لقد وصلت إلى الحد الأقصى للأسئلة كزائر. قم بتسجيل الدخول للحصول على 25 سؤال كل 3 أيام.",
            "You have reached the maximum limit of questions as a guest. Sign in to get 25 questions every 3 days."
          ),
          {
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 5000
          }
        );
      }
    }
  }, [questionsCount, user, remainingQuestions, daysUntilReset, isLoading, isPaidUser, canAskMoreQuestions, translate]);
  
  // إذا كان المستخدم مدفوع، لا نعرض أي معلومات
  if (isPaidUser) return null;
  
  // أثناء التحميل
  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <span className="mr-1 h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></span>
        {translate("جاري التحميل...", "Loading...")}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-2 p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {translate("الأسئلة المتبقية", "Remaining Questions")}:
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                  <InfoIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {user 
                  ? translate(
                      `يمكنك طرح 25 سؤال كل 3 أيام. سيتم تجديد رصيدك بعد ${daysUntilReset} ${daysUntilReset === 1 ? 'يوم' : 'أيام'}.`,
                      `You can ask 25 questions every 3 days. Your balance will be renewed after ${daysUntilReset} ${daysUntilReset === 1 ? 'day' : 'days'}.`
                    )
                  : translate(
                      "يمكنك طرح 3 أسئلة فقط كزائر. قم بتسجيل الدخول للحصول على 25 سؤال كل 3 أيام.",
                      "You can ask only 3 questions as a guest. Sign in to get 25 questions every 3 days."
                    )
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${remainingQuestions <= 3 ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
            {remainingQuestions === Infinity ? "∞" : remainingQuestions}
          </span>
          
          {!user && remainingQuestions < 5 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAuthDialog(true)}
              className="text-xs px-2 py-1 h-7"
            >
              {translate("سجل دخولك للمزيد", "Sign in for more")}
            </Button>
          )}
        </div>
      </div>
      
      {user && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {translate(
            `سيتم تجديد رصيدك بعد ${daysUntilReset} ${daysUntilReset === 1 ? 'يوم' : 'أيام'}.`,
            `Your balance will be renewed after ${daysUntilReset} ${daysUntilReset === 1 ? 'day' : 'days'}.`
          )}
        </div>
      )}
      
      {!user && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {translate(
            "قم بتسجيل الدخول للحصول على 25 سؤال كل 3 أيام.",
            "Sign in to get 25 questions every 3 days."
          )}
        </div>
      )}
      
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
} 