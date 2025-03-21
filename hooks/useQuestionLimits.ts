import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Constants
const FREE_QUESTIONS_LIMIT = 3; // حد الأسئلة للزوار
const REGISTERED_QUESTIONS_LIMIT = 25; // حد الأسئلة للمستخدمين المسجلين
const RESET_PERIOD_DAYS = 3; // فترة إعادة تعيين العداد بالأيام

export function useQuestionLimits() {
  const { user } = useAuth();
  const supabase = createClientComponent();
  const [questionsCount, setQuestionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [lastReset, setLastReset] = useState<Date | null>(null);

  // Load user's question count and paid status
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        // Check local storage for anonymous user's question count
        const localCount = localStorage.getItem('anonymousQuestionsCount');
        setQuestionsCount(localCount ? parseInt(localCount, 10) : 0);
        setIsPaidUser(false);
        setLastReset(new Date()); // استخدم التاريخ الحالي للزوار
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('questions_count, is_paid_user, last_questions_reset')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Set the state with the fetched data
        setQuestionsCount(profileData?.questions_count || 0);
        setIsPaidUser(profileData?.is_paid_user || false);
        
        // استخدام تاريخ آخر إعادة تعيين أو التاريخ الحالي إذا كان فارغاً
        if (profileData?.last_questions_reset) {
          setLastReset(new Date(profileData.last_questions_reset));
        } else {
          setLastReset(new Date());
          // إذا لم يكن لدينا تاريخ إعادة تعيين، نقوم بتحديثه في قاعدة البيانات
          await supabase
            .from('profiles')
            .update({ last_questions_reset: new Date().toISOString() })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // عمليات الاسترجاع التي تفشل لا تمنع المستخدم من استخدام التطبيق
        // نستخدم القيم الافتراضية
        setQuestionsCount(0);
        setIsPaidUser(false);
        setLastReset(new Date());
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, supabase]);

  // Reset question count after the reset period
  const resetQuestionCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const now = new Date();
      const { error } = await supabase
        .from('profiles')
        .update({ 
          questions_count: 0,
          last_questions_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setQuestionsCount(0);
      setLastReset(now);
      
      toast.success('تم تجديد رصيد الأسئلة');
    } catch (error) {
      console.error('Error resetting question count:', error);
    }
  }, [user, supabase]);

  // Increment question count
  const incrementQuestionCount = useCallback(async () => {
    if (user) {
      // Logged in user - update in database
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            questions_count: questionsCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
        
        setQuestionsCount(prev => prev + 1);
      } catch (error) {
        console.error('Error incrementing question count:', error);
        // لا نظهر رسالة الخطأ للمستخدم لكي لا نعيق التجربة
        // نقوم بتحديث العدد محلياً على أي حال
        setQuestionsCount(prev => prev + 1);
      }
    } else {
      // Anonymous user - update in local storage
      const newCount = questionsCount + 1;
      localStorage.setItem('anonymousQuestionsCount', newCount.toString());
      setQuestionsCount(newCount);
    }
  }, [user, questionsCount, supabase]);

  // Check if user can ask more questions
  const canAskMoreQuestions = useCallback(() => {
    if (isPaidUser) return true;
    
    const limit = user ? REGISTERED_QUESTIONS_LIMIT : FREE_QUESTIONS_LIMIT;
    return questionsCount < limit;
  }, [questionsCount, isPaidUser, user]);

  // Get remaining questions
  const getRemainingQuestions = useCallback(() => {
    if (isPaidUser) return Infinity;
    
    const limit = user ? REGISTERED_QUESTIONS_LIMIT : FREE_QUESTIONS_LIMIT;
    return Math.max(0, limit - questionsCount);
  }, [questionsCount, isPaidUser, user]);

  // Get time until next reset if user is registered
  const getTimeUntilReset = useCallback(() => {
    if (!user || !lastReset) return 3; // إذا لم يكن هناك تاريخ إعادة تعيين، نعيد القيمة الافتراضية 3
    
    const nextReset = new Date(lastReset);
    nextReset.setDate(nextReset.getDate() + RESET_PERIOD_DAYS);
    
    const now = new Date();
    const diffTime = nextReset.getTime() - now.getTime();
    
    // If time is negative, reset should happen now
    if (diffTime <= 0) {
      // يجب استدعاء resetQuestionCount هنا، لكن نتجنب استدعائه مباشرة لتجنب حلقة لانهائية
      return 0;
    }
    
    // Return time in days (rounded up)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [user, lastReset]);

  // Save question to database
  const saveQuestion = useCallback(async (question: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          question: question,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving question:', error);
      // Don't show error to user as this is not critical
    }
  }, [user, supabase]);

  return {
    questionsCount,
    isLoading,
    isPaidUser,
    incrementQuestionCount,
    canAskMoreQuestions,
    getRemainingQuestions,
    getTimeUntilReset,
    saveQuestion
  };
} 