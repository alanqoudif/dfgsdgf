// /app/api/chat/route.ts
import { getGroupConfig } from '@/app/actions';
import { serverEnv } from '@/env/server';
import { xai } from '@ai-sdk/xai';
import { cerebras } from '@ai-sdk/cerebras';
import { anthropic } from '@ai-sdk/anthropic'
import { groq } from '@ai-sdk/groq'
import CodeInterpreter from '@e2b/code-interpreter';
import FirecrawlApp from '@mendable/firecrawl-js';
import { tavily } from '@tavily/core';
import {
    convertToCoreMessages,
    smoothStream,
    streamText,
    tool,
    createDataStreamResponse,
    wrapLanguageModel,
    extractReasoningMiddleware,
    customProvider,
    generateObject,
    NoSuchToolError
} from 'ai';
import Exa from 'exa-js';
import { z } from 'zod';
import { geolocation } from '@vercel/functions';
import MemoryClient from 'mem0ai';
import { type NextRequest, NextResponse } from 'next/server';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LangChainStream } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { checkUserLimit, saveQuestion, getUploadedFiles } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { TEMPLATE } from '@/lib/constants';
import { getSearchGroupPrompt } from '@/app/actions';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { getCollegeDataForAI, searchCollegeData } from '@/lib/collegeData';
import { OpenAI } from 'openai';
import { getSupabaseClient } from '@/lib/supabase';

const scira = customProvider({
    languageModels: {
        'scira-default': xai('grok-2-1212'),
        'scira-vision': xai('grok-2-vision-1212'),
        'scira-llama': cerebras('llama-3.3-70b'),
        'scira-sonnet': anthropic('claude-3-7-sonnet-20250219'),
        'scira-r1': wrapLanguageModel({
            model: groq('deepseek-r1-distill-llama-70b'),
            middleware: extractReasoningMiddleware({ tagName: 'think' })
        }),
    }
})

// Allow streaming responses up to 600 seconds
export const maxDuration = 600;

interface XResult {
    id: string;
    url: string;
    title: string;
    author?: string;
    publishedDate?: string;
    text: string;
    highlights?: string[];
    tweetId: string;
}

interface MapboxFeature {
    id: string;
    name: string;
    formatted_address: string;
    geometry: {
        type: string;
        coordinates: number[];
    };
    feature_type: string;
    context: string;
    coordinates: number[];
    bbox: number[];
    source: string;
}

interface GoogleResult {
    place_id: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
        viewport: {
            northeast: {
                lat: number;
                lng: number;
            };
            southwest: {
                lat: number;
                lng: number;
            };
        };
    };
    types: string[];
    address_components: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
}

interface VideoDetails {
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
    type?: string;
    provider_name?: string;
    provider_url?: string;
}

interface VideoResult {
    videoId: string;
    url: string;
    details?: VideoDetails;
    captions?: string;
    timestamps?: string[];
    views?: string;
    likes?: string;
    summary?: string;
}

function sanitizeUrl(url: string): string {
    return url.replace(/\s+/g, '%20');
}

async function isValidImageUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeout);

        return response.ok && (response.headers.get('content-type')?.startsWith('image/') ?? false);
    } catch {
        return false;
    }
}


const extractDomain = (url: string): string => {
    const urlPattern = /^https?:\/\/([^/?#]+)(?:[/?#]|$)/i;
    return url.match(urlPattern)?.[1] || url;
};

const deduplicateByDomainAndUrl = <T extends { url: string }>(items: T[]): T[] => {
    const seenDomains = new Set<string>();
    const seenUrls = new Set<string>();

    return items.filter(item => {
        const domain = extractDomain(item.url);
        const isNewUrl = !seenUrls.has(item.url);
        const isNewDomain = !seenDomains.has(domain);

        if (isNewUrl && isNewDomain) {
            seenUrls.add(item.url);
            seenDomains.add(domain);
            return true;
        }
        return false;
    });
};

const messageSchema = z.object({
  content: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'tool', 'data', 'function']),
});

const schema = z.object({
  prompt: z.string(),
  messages: z.array(messageSchema).optional(),
  selectedTemplate: z.string().optional(),
});

// Create a simple streaming response function since LangChainStream might not be available
const createStreamingResponse = (
  stream: ReadableStream
) => {
  return new Response(stream);
};

// Mock function for getGroupConfig since it's missing
const getGroupConfigMock = (groupId = 'web') => {
  return {
    tools: [],
    systemPrompt: '',
    toolInstructions: '',
    responseGuidelines: ''
  };
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { messages, model = 'gpt-4o' } = body;
    
    // Get the last message from the user to check if it's related to colleges
    const lastMessage = messages[messages.length - 1].content;
    
    // Check if the last message is related to colleges
    const isCollegeRelated = isMessageCollegeRelated(lastMessage);
    
    // Prepare system message with appropriate context
    let systemPrompt = 'أنت مساعد ذكي يقدم إجابات مفيدة ودقيقة وقصيرة.';
    
    // If college-related, search for relevant college data and add to the context
    if (isCollegeRelated) {
      const collegeData = await searchCollegeData(lastMessage);
      if (collegeData && collegeData.length > 0) {
        systemPrompt = `أنت مساعد ذكي متخصص في المعلومات الجامعية في سلطنة عمان. 
استخدم المعلومات التالية للإجابة على أسئلة المستخدم بشكل دقيق ومفيد:

${collegeData.join('\n\n')}

إذا كان السؤال لا يتعلق بالمعلومات المقدمة، أخبر المستخدم بأنك لا تملك معلومات كافية وأنه يمكنه التواصل مباشرة مع الجامعة للحصول على معلومات أكثر تفصيلاً.
إذا لم يكن سؤال المستخدم متعلقًا بالجامعات أو الكليات، فقدم إجابة عامة ومفيدة.`;
      }
    }
    
    // Set up OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
    
    // Prepare messages for OpenAI
    const messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    // Generate streaming response
    const response = await openai.chat.completions.create({
      model,
      messages: messagesToSend,
      stream: true
    });
    
    // Return streaming response
    return new StreamingTextResponse(response.toReadableStream());
    
  } catch (error: any) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during chat' },
      { status: 500 }
    );
  }
}

// Helper function to check if a message is related to colleges
function isMessageCollegeRelated(message: string): boolean {
  const collegeKeywords = [
    'كلية', 'جامعة', 'الشرق الأوسط', 'صحار', 'رسوم', 'تسجيل', 'تخصص', 'قبول',
    'منح', 'طلاب', 'دراسة', 'تعليم', 'دراسي', 'college', 'university', 'middle east',
    'sohar', 'fees', 'tuition', 'admission', 'scholarship', 'student', 'education'
  ];
  
  const messageLower = message.toLowerCase();
  return collegeKeywords.some(keyword => 
    messageLower.includes(keyword.toLowerCase())
  );
}