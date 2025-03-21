import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, record } = body;
    
    // Get the Supabase client
    const supabase = createServerClient();
    
    // Handle the event based on the type
    switch (type) {
      case 'INSERT':
        // A user was created in auth.users
        // Create a corresponding profile
        if (record && record.id) {
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: record.id,
              email: record.email,
              questions_count: 0,
              is_paid_user: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('Error creating profile:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
          }
        }
        break;
      
      case 'UPDATE':
        // Handle user updates if needed
        break;
        
      case 'DELETE':
        // The profile should be deleted automatically due to ON DELETE CASCADE
        break;
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 