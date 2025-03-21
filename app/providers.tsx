"use client";

import { clientEnv } from "@/env/client";
import { ThemeProvider } from "next-themes";
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { ReactNode, useMemo } from "react";

// Create a mock PostHog client for development or when API key is missing
const createMockPosthogClient = () => {
  return {
    capture: () => {},
    identify: () => {},
    reset: () => {},
    // Add other necessary methods that might be used in your app
    getFeatureFlag: () => null,
    isFeatureEnabled: () => false,
    getSessionId: () => null,
    register: () => {},
    unregister: () => {},
    reloadFeatureFlags: () => Promise.resolve(),
    startSessionRecording: () => {},
    stopSessionRecording: () => {},
  };
};

// Only initialize PostHog in production with valid API key
if (typeof window !== 'undefined' && 
    process.env.NODE_ENV === 'production' && 
    clientEnv.NEXT_PUBLIC_POSTHOG_KEY && 
    clientEnv.NEXT_PUBLIC_POSTHOG_KEY !== 'dummy_value') {
  posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    person_profiles: 'always',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
    }
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // Create PostHog client with useMemo to ensure it's only created once
  const posthogClient = useMemo(() => {
    // Always return a valid client object (real or mock)
    if (typeof window !== 'undefined' && 
        process.env.NODE_ENV === 'production' && 
        clientEnv.NEXT_PUBLIC_POSTHOG_KEY && 
        clientEnv.NEXT_PUBLIC_POSTHOG_KEY !== 'dummy_value') {
      return posthog;
    }
    return createMockPosthogClient();
  }, []);
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Only use PostHogProvider in production with a valid key */}
      {process.env.NODE_ENV === 'production' && 
       clientEnv.NEXT_PUBLIC_POSTHOG_KEY && 
       clientEnv.NEXT_PUBLIC_POSTHOG_KEY !== 'dummy_value' ? (
        <PostHogProvider client={posthogClient}>
          {children}
        </PostHogProvider>
      ) : (
        children
      )}
    </ThemeProvider>
  );
}