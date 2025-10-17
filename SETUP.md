# TaskFlow Setup Guide

## Quick Start for AI Chat

The AI chat feature requires an OpenRouter API key to function. Follow these steps:

### 1. Get Your OpenRouter API Key

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Navigate to **Keys** in your dashboard
4. Create a new API key
5. Copy the key (it will look like: `sk-or-v1-...`)

### 2. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your OpenRouter API key:
   ```env
   OPENROUTER_DEEPSEEK_API_KEY=sk-or-v1-your-actual-key-here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### 3. Test the AI Chat

1. Navigate to `/webapp/ai` in your app
2. Try sending a message like "Hello, can you help me?"
3. The AI should respond without any errors

## Current AI Models

The AI chat currently uses **DeepSeek V3.1** (free tier) through OpenRouter:
- Model: `deepseek/deepseek-chat-v3.1:free`
- Supports function calling for task management
- Fast and reliable

## Troubleshooting

### "OpenRouter API key not found" Error

**Cause**: The `OPENROUTER_DEEPSEEK_API_KEY` environment variable is not set.

**Solution**:
1. Make sure you created `.env.local` (not `.env`)
2. Verify the key is correctly copied without extra spaces
3. Restart your dev server (`npm run dev`)

### API Key Invalid

**Cause**: The API key might be expired or incorrect.

**Solution**:
1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Generate a new key
3. Update your `.env.local` file
4. Restart the server

## Future Plans

This branch (`cursor/update-ai-chat-for-streaming-and-new-models-3511`) is being prepared for:
- [ ] Streaming responses for faster perceived performance
- [ ] Support for multiple AI models (GPT-4, Claude, Gemini)
- [ ] Model selection dropdown in the UI

## Need Help?

Check the main [README.md](./README.md) for comprehensive setup instructions or open an issue on GitHub.
