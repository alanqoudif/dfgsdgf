// https://env.t3.gg/docs/nextjs#create-your-schema
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional().default("dummy_value"),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional().default("dummy_value"),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional().default("https://dummy-url.com"),
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional().default("dummy_value"),
    NEXT_PUBLIC_VERCEL_ENV: z.string().optional().default("development"),
    NEXT_PUBLIC_VERCEL_URL: z.string().optional().default("localhost:3000"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === 'production',
  emptyStringAsUndefined: true,
})

