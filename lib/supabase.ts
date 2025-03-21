'use client';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to create a client component instance
export const createClientComponent = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
};

// Free tier limit for questions
export const FREE_TIER_QUESTIONS_LIMIT = 25;

/**
 * Save a question and its answer to the database
 */
export async function saveQuestion({
  userId,
  question,
  answer,
}: {
  userId: string;
  question: string;
  answer: string;
}) {
  try {
    // Insert the question into the questions table
    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          user_id: userId,
          question: question,
          answer: answer,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving question:', error);
      return { success: false, error };
    }

    // Increment the user's question count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ questions_count: supabase.rpc('increment_count', { row_id: userId }) })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating question count:', updateError);
      return { success: false, error: updateError };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in saveQuestion:', error);
    return { success: false, error };
  }
}

/**
 * Check if a user has reached their daily question limit
 */
export async function checkUserLimit(userId: string) {
  try {
    // Get user data to check if they are on the paid tier
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('questions_count, is_paid_user, last_questions_reset')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return { hasReachedLimit: false, error: userError, questionsLeft: FREE_TIER_QUESTIONS_LIMIT, daysToReset: null };
    }

    // Premium users have no limit
    if (userData.is_paid_user) {
      return { hasReachedLimit: false, error: null, questionsLeft: null, daysToReset: null };
    }

    // Calculate time until reset (3 days from last reset)
    let daysToReset = null;
    if (userData.last_questions_reset) {
      const resetDate = new Date(userData.last_questions_reset);
      resetDate.setDate(resetDate.getDate() + 3); // Reset after 3 days
      const now = new Date();
      const timeDiff = resetDate.getTime() - now.getTime();
      daysToReset = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }

    // For free tier users, check questions_count
    const questionsLeft = Math.max(0, FREE_TIER_QUESTIONS_LIMIT - (userData.questions_count || 0));
    
    // Check if the user has reached the limit
    return {
      hasReachedLimit: questionsLeft <= 0,
      questionsLeft: questionsLeft,
      daysToReset: daysToReset,
      error: null,
    };
  } catch (error) {
    console.error('Error in checkUserLimit:', error);
    return { hasReachedLimit: false, error, questionsLeft: FREE_TIER_QUESTIONS_LIMIT, daysToReset: null };
  }
}

/**
 * Get a user's questions
 */
export async function getUserQuestions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user questions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserQuestions:', error);
    return [];
  }
}

/**
 * Get question details by ID
 */
export async function getQuestionById(questionId: string) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    return null;
  }
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string, userId: string) {
  try {
    // First verify the question belongs to the user
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', questionId)
      .single();

    if (questionError) {
      console.error('Error fetching question:', questionError);
      return { success: false, error: questionError };
    }

    if (questionData.user_id !== userId) {
      return {
        success: false,
        error: { message: 'Not authorized to delete this question' },
      };
    }

    // Delete the question
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('Error deleting question:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    return { success: false, error };
  }
}

/**
 * Reset a user's question count (for testing purposes or manual reset)
 */
export async function resetUserQuestionCount(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        questions_count: 0,
        last_questions_reset: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error resetting question count:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resetUserQuestionCount:', error);
    return { success: false, error };
  }
}

/**
 * Get the user's profile information
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
} 