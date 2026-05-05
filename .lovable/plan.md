
# Fix AI Chat "Trouble Connecting" Error

## Problem

The AI Chat page calls the Lovable AI Gateway **directly from the client** (no auth token) using an unsupported model (`claude-sonnet-4-20250514`). Both issues cause the request to fail silently.

## Solution

The project already has a working `ai-chat` edge function that properly routes to AI providers. Update `AIChat.tsx` to call it via the Supabase client instead of making direct fetch calls.

## Changes

**File: `src/pages/AIChat.tsx`**

1. Import `supabase` client
2. Replace the direct `fetch("https://ai.gateway.lovable.dev/...")` call with `supabase.functions.invoke('ai-chat', { body: { messages } })`
3. Remove the hardcoded unsupported model reference
4. Parse the response from `{ response, model, usage }` format (which is what the edge function returns)

The system prompt will be sent as the first message in the messages array, same as before. The edge function handles model selection automatically.
