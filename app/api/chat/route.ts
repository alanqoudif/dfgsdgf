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
import { type NextRequest } from 'next/server';
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { LangChainStream } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { checkUserLimit, saveQuestion } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { TEMPLATE } from '@/lib/constants';
import { getSearchGroupPrompt } from '@/app/actions';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, messages, selectedTemplate } = schema.parse(body);

    // Get the current user
    const user = await getCurrentUser();
    const userId = user?.id;
    
    // Check if user has reached their limit
    if (!userId) {
      // For anonymous users, check if they've reached the limit (store in session)
      const { cookies } = req;
      const anonQuestionCount = parseInt(cookies.get('anonQuestionCount')?.value || '0');
      
      if (anonQuestionCount >= 3) {
        return new Response(
          JSON.stringify({
            error: 'Limit reached',
            message: 'You have reached your question limit. Please sign in to continue.',
          }),
          { status: 403 }
        );
      }
      
      // Increment anonymous question count in cookie
      cookies.set('anonQuestionCount', (anonQuestionCount + 1).toString());
                                    } else {
      // For logged-in users, check their limit in the database
      const { hasReachedLimit, error } = await checkUserLimit(userId);
      
      if (error) {
        console.error('Error checking user limit:', error);
      }
      
      if (hasReachedLimit) {
        return new Response(
          JSON.stringify({
            error: 'Limit reached',
            message: 'You have reached your question limit. Please subscribe to our premium plan to continue.',
          }),
          { status: 403 }
        );
      }
    }

    // Setup the language model
    const { stream, handlers } = LangChainStream();

    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      streaming: true,
      temperature: 0.7,
    });

    let systemPrompt = TEMPLATE;
    
    if (selectedTemplate) {
      systemPrompt = await getSearchGroupPrompt(selectedTemplate as any) || TEMPLATE;
    }

    const langchainMessages = [
      new SystemMessage(systemPrompt),
      ...((messages ?? [])
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => {
          if (message.role === 'user') {
            return new HumanMessage(message.content);
                                                    } else {
            return new AIMessage(message.content);
          }
        })),
      new HumanMessage(prompt),
    ];

    // Make call to language model
    const response = await llm.call(langchainMessages, {}, [handlers]).catch(console.error);
    
    // After processing the request successfully, save the question and answer to the database
    if (userId && response) {
      try {
        await saveQuestion({
          userId,
          question: prompt,
          answer: response.content,
        });
      } catch (saveError) {
        console.error('Error saving question:', saveError);
      }
    }

    return new Response(stream);
                            } catch (error) {
    console.error('[LLM ERROR]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}