import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { User, Question } from './supabase';

// Supabase client for server components and API routes
export const createServerClient = () => {
  return createServerComponentClient({ cookies });
}; 