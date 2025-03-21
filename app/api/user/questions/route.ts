import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json({ error: 'Error fetching user profile' }, { status: 500 });
    }
    
    // Get user's questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (questionsError) {
      return NextResponse.json({ error: 'Error fetching questions' }, { status: 500 });
    }
    
    // Return the profile and questions
    return NextResponse.json({
      profile,
      questions,
      remainingQuestions: profile.is_paid_user ? Infinity : Math.max(0, 3 - profile.questions_count)
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    const { question } = body;
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add the question
    const { data, error } = await supabase
      .from('questions')
      .insert({
        user_id: session.user.id,
        question,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Error adding question' }, { status: 500 });
    }
    
    // Increment the question count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        questions_count: supabase.rpc('increment_questions_count', { user_id: session.user.id }),
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);
    
    if (updateError) {
      return NextResponse.json({ error: 'Error updating question count' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, question: data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 