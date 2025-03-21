import { useEffect, useState, useCallback } from 'react';
import { getUserId } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ANONYMOUS_QUESTION_LIMIT = 3; // Anonymous users can only ask 3 questions

export function useQuestionLimit() {
  const [questionsLeft, setQuestionsLeft] = useState<number | null>(null);
  const [daysToReset, setDaysToReset] = useState<number | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const router = useRouter();

  // Track anonymous questions in localStorage
  const getAnonymousQuestionCount = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    try {
      return parseInt(localStorage.getItem('anonymousQuestionCount') || '0', 10);
    } catch (e) {
      console.error('خطأ في قراءة عدد الأسئلة من localStorage:', e);
      return 0;
    }
  }, []);

  const incrementAnonymousQuestionCount = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const count = getAnonymousQuestionCount() + 1;
      localStorage.setItem('anonymousQuestionCount', count.toString());
      return count;
    } catch (e) {
      console.error('خطأ في زيادة عدد الأسئلة في localStorage:', e);
      return 0;
    }
  }, [getAnonymousQuestionCount]);

  // Get local fallback data when API fails
  const getLocalFallbackData = useCallback(() => {
    const count = getAnonymousQuestionCount();
    return {
      isAnonymous: true,
      hasReachedLimit: count >= ANONYMOUS_QUESTION_LIMIT,
      questionsLeft: Math.max(0, ANONYMOUS_QUESTION_LIMIT - count),
      daysToReset: null,
    };
  }, [getAnonymousQuestionCount]);

  // Check limit via API endpoint
  const checkLimitViaApi = useCallback(async () => {
    try {
      setFetchError(false);
      const anonymousCount = getAnonymousQuestionCount();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/check-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anonymousCount }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('خطأ في الاستجابة من API:', response.status, response.statusText);
        setFetchError(true);
        return getLocalFallbackData();
      }
      
      const data = await response.json();
      if (data.error) {
        console.error('خطأ في بيانات API:', data.error);
        setFetchError(true);
        return getLocalFallbackData();
      }
      
      return data;
    } catch (error) {
      console.error('خطأ في التحقق من الحد عبر API:', error);
      setFetchError(true);
      // Fallback to client-side anonymous check if API fails
      return getLocalFallbackData();
    }
  }, [getAnonymousQuestionCount, getLocalFallbackData]);

  // Check limit on component mount
  useEffect(() => {
    const checkLimit = async () => {
      setIsLoading(true);
      
      try {
        const limitData = await checkLimitViaApi();
        
        setIsAnonymous(limitData.isAnonymous);
        setQuestionsLeft(limitData.questionsLeft);
        setDaysToReset(limitData.daysToReset);
        setHasReachedLimit(limitData.hasReachedLimit);
      } catch (e) {
        console.error('خطأ غير متوقع في التحقق من الحد:', e);
        // Use fallback data
        const fallbackData = getLocalFallbackData();
        setIsAnonymous(fallbackData.isAnonymous);
        setQuestionsLeft(fallbackData.questionsLeft);
        setDaysToReset(fallbackData.daysToReset);
        setHasReachedLimit(fallbackData.hasReachedLimit);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLimit();
  }, [checkLimitViaApi, getLocalFallbackData]);

  // Function to handle question submission
  const handleQuestionSubmit = useCallback(async () => {
    if (isLoading) return { canProceed: true, questionsLeft: null }; // Allow if still loading to prevent blocking
    
    try {
      // If there was a fetch error before, we'll use local data only
      if (fetchError) {
        const localData = getLocalFallbackData();
        setQuestionsLeft(localData.questionsLeft);
        setDaysToReset(localData.daysToReset);
        setHasReachedLimit(localData.hasReachedLimit);
        
        if (localData.hasReachedLimit) {
          toast.error('لقد استخدمت 3 أسئلة. يرجى تسجيل الدخول للاستمرار.', {
            action: {
              label: 'تسجيل الدخول',
              onClick: () => router.push('/login')
            },
          });
          return { canProceed: false, questionsLeft: localData.questionsLeft };
        }
        
        // If we're anonymous, increment the count locally
        incrementAnonymousQuestionCount();
        const remainingQuestions = Math.max(0, ANONYMOUS_QUESTION_LIMIT - (getAnonymousQuestionCount() || 0));
        return { canProceed: true, questionsLeft: remainingQuestions };
      }
      
      // Get the latest limit status from API
      const limitData = await checkLimitViaApi();
      
      setQuestionsLeft(limitData.questionsLeft);
      setDaysToReset(limitData.daysToReset);
      setHasReachedLimit(limitData.hasReachedLimit);
      
      if (limitData.hasReachedLimit) {
        if (limitData.isAnonymous) {
          toast.error('لقد استخدمت 3 أسئلة. يرجى تسجيل الدخول للاستمرار.', {
            action: {
              label: 'تسجيل الدخول',
              onClick: () => router.push('/login')
            },
          });
        } else {
          toast.error('لقد وصلت إلى الحد الأقصى من الأسئلة. يرجى الانتظار حتى يتم تجديد رصيدك.');
        }
        return { canProceed: false, questionsLeft: limitData.questionsLeft };
      }
      
      // If we're anonymous, increment the count locally
      if (limitData.isAnonymous) {
        incrementAnonymousQuestionCount();
        // نقوم بحساب عدد الرسائل المتبقية بعد الزيادة
        const remainingQuestions = Math.max(0, ANONYMOUS_QUESTION_LIMIT - getAnonymousQuestionCount());
        return { canProceed: true, questionsLeft: remainingQuestions };
      }
      
      return { canProceed: true, questionsLeft: limitData.questionsLeft };
    } catch (e) {
      console.error('خطأ في معالجة تقديم السؤال:', e);
      // On error, allow proceeding to prevent blocking user
      return { canProceed: true, questionsLeft: null };
    }
  }, [
    isLoading, 
    fetchError, 
    checkLimitViaApi, 
    incrementAnonymousQuestionCount, 
    getAnonymousQuestionCount,
    router, 
    getLocalFallbackData
  ]);

  return {
    questionsLeft,
    daysToReset,
    hasReachedLimit,
    isLoading,
    isAnonymous,
    handleQuestionSubmit,
    fetchError
  };
} 