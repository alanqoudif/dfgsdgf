"use client";

import { clientEnv } from "@/env/client";
import { ThemeProvider } from "next-themes";
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { ReactNode } from "react";

// Only initialize PostHog in production with valid API key
if (typeof window !== 'undefined' && 
    process.env.NODE_ENV === 'production' && 
    clientEnv.NEXT_PUBLIC_POSTHOG_KEY && 
    clientEnv.NEXT_PUBLIC_POSTHOG_KEY !== 'dummy_value') {
  posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'always',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
    }
  });
}

// Create a mock PostHog client for development
const createMockPosthogClient = () => {
  return {
    capture: () => {},
    identify: () => {},
    reset: () => {},
    // Add other necessary methods that might be used in your app
  };
};

export function Providers({ children }: { children: ReactNode }) {
  // Use real PostHog in production, mock in development
  const posthogClient = typeof window !== 'undefined' && 
    process.env.NODE_ENV === 'production' && 
    clientEnv.NEXT_PUBLIC_POSTHOG_KEY && 
    clientEnv.NEXT_PUBLIC_POSTHOG_KEY !== 'dummy_value'
      ? posthog 
      : createMockPosthogClient();
  
  return (
    <PostHogProvider client={posthogClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </PostHogProvider>
  )
}