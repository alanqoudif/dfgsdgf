import React, { useEffect } from 'react';
import { useQuestionLimit } from '@/hooks/useQuestionLimit';
import { QuestionLimitWarning } from '@/components/QuestionLimitWarning';
import FormComponent from '@/components/ui/form-component';
import { useLanguage } from '@/app/language-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FormWrapperProps {
  // Forward all props from page to FormComponent
  [key: string]: any;
}

export default function FormWrapper(props: FormWrapperProps) {
  const { translate } = useLanguage();
  const router = useRouter();
  
  const { 
    questionsLeft, 
    daysToReset, 
    hasReachedLimit, 
    isAnonymous, 
    handleQuestionSubmit,
    fetchError
  } = useQuestionLimit();
  
  // Create a wrapped version of handleSubmit that checks limits first
  const originalHandleSubmit = props.handleSubmit;
  const wrappedHandleSubmit: typeof originalHandleSubmit = async (event, options) => {
    // إذا كان هناك خطأ في الاتصال، السماح للمستخدم بالاستمرار
    if (fetchError) {
      console.log('هناك خطأ اتصال - السماح بإرسال السؤال بدون التحقق من الحد');
      return originalHandleSubmit(event, options);
    }
    
    try {
      // التحقق مما إذا كان المستخدم قد وصل إلى الحد
      const result = await handleQuestionSubmit();
      
      if (!result || !result.canProceed) {
        // إذا كان المستخدم المجهول قد وصل إلى الحد، عرض مطالبة بالتسجيل
        if (isAnonymous) {
          toast.error(translate(
            'لقد استخدمت 3 أسئلة. يرجى تسجيل الدخول للاستمرار.',
            'You have used 3 questions. Please sign in to continue.'
          ), {
            action: {
              label: translate('تسجيل الدخول', 'Sign in'),
              onClick: () => router.push('/login')
            },
            duration: 5000
          });
        }
        return null;
      }
      
      // إذا كان بإمكانهم المتابعة، استدعاء المعالج الأصلي
      return originalHandleSubmit(event, options);
    } catch (error) {
      console.error('خطأ في التحقق من حد الأسئلة:', error);
      // في حالة الخطأ، السماح للمستخدم بالاستمرار لتجنب منع التجربة
      return originalHandleSubmit(event, options);
    }
  };
  
  // إظهار رسالة خطأ واحدة فقط في حالة وجود مشكلة في الاتصال
  useEffect(() => {
    if (fetchError) {
      toast.error(translate(
        'لا يمكن التحقق من حد الأسئلة. ستتمكن من متابعة الاستخدام.',
        'Could not verify question limit. You will be able to continue using the service.'
      ), {
        duration: 5000,
        id: 'fetch-error', // منع تكرار نفس الإشعار
      });
    }
  }, [fetchError, translate]);
  
  return (
    <div className="w-full">
      {/* عرض تحذير في حالة اقتراب المستخدم من حد الأسئلة */}
      {questionsLeft !== null && questionsLeft <= 5 && !hasReachedLimit && !fetchError && (
        <QuestionLimitWarning 
          questionsLeft={questionsLeft} 
          daysToReset={daysToReset}
          isPaidUser={!isAnonymous && questionsLeft === null} 
        />
      )}
      
      {/* عرض مكون النموذج الأصلي مع معالج submit المُعدّل */}
      <FormComponent {...props} handleSubmit={wrappedHandleSubmit} />
    </div>
  );
} 