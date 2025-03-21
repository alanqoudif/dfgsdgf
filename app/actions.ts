// app/actions.ts
'use server'

import { getCollections, pagesData } from '@/lib/pages'
import { searchCollegeData } from '@/lib/collegeData'
import { getSupabaseClient } from '@/lib/supabase'

// Types for suggestions
export type SuggestionSource = 'AI' | 'College-MEC' | 'College-SU'

export type Suggestion = {
  text: string
  source: SuggestionSource
}

export async function suggestQuestions(prompt: string): Promise<Suggestion[]> {
  try {
    const trimmedPrompt = prompt.trim()
    
    if (!trimmedPrompt || trimmedPrompt.length < 3) {
      // Default college questions when no significant input is provided
      return getDefaultCollegeQuestions()
    }

    // Always include college data in suggestions
    const collegeQuestions = searchCollegeData(trimmedPrompt)
    
    let suggestions: Suggestion[] = collegeQuestions.slice(0, 3).map(item => ({
      text: item.question,
      source: item.source.includes('middle-east') ? 'College-MEC' : 'College-SU'
    }))

    // If we have space, add AI-generated suggestions
    if (suggestions.length < 5) {
      try {
        // Simple AI-based suggestions
        const aiSuggestions = [
          `ما هي ${trimmedPrompt}؟`,
          `كيف يمكنني ${trimmedPrompt}؟`,
          `اشرح لي عن ${trimmedPrompt}`,
          `ما هي فوائد ${trimmedPrompt}؟`,
          `ما الفرق بين ${trimmedPrompt} و...؟`
        ].map(text => ({ text, source: 'AI' as SuggestionSource }))
        
        // Add AI suggestions to fill up to 5 total suggestions
        suggestions = [...suggestions, ...aiSuggestions.slice(0, 5 - suggestions.length)]
      } catch (error) {
        console.error('Error generating AI suggestions:', error)
      }
    }

    return suggestions
  } catch (error) {
    console.error('Error in suggestQuestions:', error)
    return getDefaultCollegeQuestions()
  }
}

// Default college questions when no input is provided
function getDefaultCollegeQuestions(): Suggestion[] {
  return [
    { text: "ما هي الرسوم الدراسية في كلية الشرق الأوسط؟", source: 'College-MEC' },
    { text: "ما هي التخصصات المتاحة في جامعة صحار؟", source: 'College-SU' },
    { text: "كيف يمكنني التقديم للمنح الدراسية؟", source: 'College-MEC' },
    { text: "ما هي متطلبات القبول في جامعة صحار؟", source: 'College-SU' },
    { text: "ما هي خطط الدفع المتاحة للطلاب في كلية الشرق الأوسط؟", source: 'College-MEC' },
  ]
}

export async function getContent() {
  return {
    collections: getCollections(),
    pages: pagesData,
  }
}

export async function getSession() {
  const supabase = getSupabaseClient()
  return supabase.auth.getSession()
}

export async function getSecrets() {
  return {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  }
}
