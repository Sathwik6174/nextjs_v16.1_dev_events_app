// lib/posthog-provider.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import React, { useEffect } from 'react'

export function PHProvider({ children }: { children:                React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
                person_profiles: 'identified_only',
                capture_pageviews: true,
                capture_pageleaves: true,
                loaded: (posthog) => {
                    if (process.env.NODE_ENV === 'development') console.log('PostHog loaded')
                }
            })
        }
    }, [])

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}