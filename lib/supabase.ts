import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determine if we're on the client side
const isClient = typeof window !== 'undefined';

// Create a single client instance for server-side
const serverSideClient = createClient(supabaseUrl, supabaseAnonKey);

// For client-side, we'll create a single instance and reuse it
let browserClient: ReturnType<typeof createClient> | null = null;

/**
 * Get the Supabase client - single instance pattern
 * This is the PREFERRED way to get the Supabase client throughout the app
 */
export function getSupabaseClient() {
  if (!isClient) {
    // On server side, always return the server-side client
    return serverSideClient;
  }
  
  // On client side, create the client once and reuse it
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
      },
    });
  }
  
  return browserClient;
}

// Legacy export for backward compatibility - DEPRECATED, use getSupabaseClient() instead
export const supabase = serverSideClient;

// Legacy function for backward compatibility - DEPRECATED, use getSupabaseClient() instead
export function createClientComponent() {
  console.warn(
    'DEPRECATED: createClientComponent() is deprecated and will be removed in a future version. ' +
    'Use getSupabaseClient() instead.'
  );
  return getSupabaseClient();
}

// Define types for database tables
export type User = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  questions_count: number;
  is_paid_user: boolean;
  last_questions_reset: string;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  user_id: string;
  question: string;
  answer?: string;
  created_at: string;
  updated_at: string;
};

export type UploadedFile = {
  name: string;
  url: string;
  size: number;
  created_at: string;
};

/**
 * Get uploaded files for AI reference
 */
export async function getUploadedFiles() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.storage
      .from('aidata')
      .list();

    if (error) {
      console.error('Error fetching uploaded files:', error);
      return [];
    }

    // Get public URLs for all files
    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const { data: urlData } = client.storage
          .from('aidata')
          .getPublicUrl(file.name);

        return {
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at || new Date().toISOString()
        };
      })
    );

    return filesWithUrls;
  } catch (error) {
    console.error('Error in getUploadedFiles:', error);
    return [];
  }
}

// Free tier limit for questions per day
const FREE_TIER_DAILY_LIMIT = 20;

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
    const client = getSupabaseClient();
    // Insert the question into the questions table
    const { data, error } = await client
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
    const { error: updateError } = await client
      .from('users')
      .update({ question_count: client.rpc('increment_count', { row_id: userId }) })
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
    const client = getSupabaseClient();
    // Get user data to check if they are on the premium tier
    const { data: userData, error: userError } = await client
      .from('users')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return { hasReachedLimit: false, error: userError };
    }

    // Premium users have no limit
    if (userData.is_premium) {
      return { hasReachedLimit: false, error: null };
    }

    // For free tier users, count questions asked in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count, error: countError } = await client
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', yesterday.toISOString());

    if (countError) {
      console.error('Error counting questions:', countError);
      return { hasReachedLimit: false, error: countError };
    }

    // Check if the user has reached the limit
    return {
      hasReachedLimit: count !== null && count >= FREE_TIER_DAILY_LIMIT,
      error: null,
    };
  } catch (error) {
    console.error('Error in checkUserLimit:', error);
    return { hasReachedLimit: false, error };
  }
}

/**
 * Get a user's questions
 */
export async function getUserQuestions(userId: string) {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
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
    const client = getSupabaseClient();
    const { data, error } = await client
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
    const client = getSupabaseClient();
    // First verify the question belongs to the user
    const { data: questionData, error: questionError } = await client
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
    const { error } = await client
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
 * Create the aidata bucket if it doesn't exist
 */
export async function createAIDataBucketIfNotExists() {
  try {
    const client = getSupabaseClient();
    // Check if bucket exists
    const { data: buckets, error: listError } = await client
      .storage
      .getBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'aidata');
    
    if (!bucketExists) {
      // Create new bucket for AI data
      const { data, error } = await client
        .storage
        .createBucket('aidata', {
          public: false, // Default to private
          fileSizeLimit: 10485760, // 10MB limit
        });
      
      if (error) throw error;
      
      // Update bucket to be public
      const { error: updateError } = await client
        .storage
        .updateBucket('aidata', {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
        });
      
      if (updateError) throw updateError;
      
      console.log('Created aidata bucket for file uploads');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating aidata bucket:', error);
    return { success: false, error };
  }
} 