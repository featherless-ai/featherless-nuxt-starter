import { z } from 'zod';
import { streamText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const BodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).min(1),
});

export default defineEventHandler(async (event) => {
  const body = BodySchema.parse(await readBody(event));
  const config = useRuntimeConfig();

  if (!config.featherlessApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'FEATHERLESS_API_KEY is not set. Configure it via the app form or .env.',
    });
  }

  const featherless = createOpenAICompatible({
    name: 'featherless',
    baseURL: config.featherlessApiBaseUrl,
    apiKey: config.featherlessApiKey,
  });

  const result = streamText({
    model: featherless(config.featherlessModel),
    messages: body.messages,
  });

  // Plain text-stream response. The page's fetch reader decodes chunks directly.
  return result.toTextStreamResponse();
});
