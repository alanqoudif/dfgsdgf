// https://env.t3.gg/docs/nextjs#create-your-schema
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const serverEnv = createEnv({
  server: {
    XAI_API_KEY: z.string().optional().default("dummy_value"),
    ANTHROPIC_API_KEY: z.string().optional().default("dummy_value"),
    CEREBRAS_API_KEY: z.string().optional().default("dummy_value"),
    GROQ_API_KEY: z.string().optional().default("dummy_value"),
    E2B_API_KEY: z.string().optional().default("dummy_value"),
    ELEVENLABS_API_KEY: z.string().optional().default("dummy_value"),
    TAVILY_API_KEY: z.string().optional().default("dummy_value"),
    EXA_API_KEY: z.string().optional().default("dummy_value"),
    TMDB_API_KEY: z.string().optional().default("dummy_value"),
    YT_ENDPOINT: z.string().optional().default("dummy_value"),
    FIRECRAWL_API_KEY: z.string().optional().default("dummy_value"),
    OPENWEATHER_API_KEY: z.string().optional().default("dummy_value"),
    SANDBOX_TEMPLATE_ID: z.string().optional().default("dummy_value"),
    GOOGLE_MAPS_API_KEY: z.string().optional().default("dummy_value"),
    MAPBOX_ACCESS_TOKEN: z.string().optional().default("dummy_value"),
    TRIPADVISOR_API_KEY: z.string().optional().default("dummy_value"),
    AVIATION_STACK_API_KEY: z.string().optional().default("dummy_value"),
    CRON_SECRET: z.string().optional().default("dummy_value"),
    BLOB_READ_WRITE_TOKEN: z.string().optional().default("dummy_value"),
    MEM0_API_KEY: z.string().optional().default("dummy_value"),
    MEM0_ORG_NAME: z.string().optional().default("dummy_value"),
    MEM0_PROJECT_NAME: z.string().optional().default("dummy_value"),
  },
  experimental__runtimeEnv: process.env,
})
