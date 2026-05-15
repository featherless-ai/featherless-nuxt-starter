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

  // Read env vars directly via process.env — works for any var the platform
  // injects from app.yaml.envTemplate, no Nuxt runtimeConfig bridge needed.
  // Adding new env vars (LINEAR_API_KEY, OPENAI_API_KEY, etc.) requires no
  // entrypoint.sh or nuxt.config.ts changes — just declare them in app.yaml
  // and read them here.
  const apiKey = process.env.FEATHERLESS_API_KEY;
  const baseURL = process.env.FEATHERLESS_API_BASE_URL ?? 'https://api.featherless.ai/v1';
  const model = process.env.FEATHERLESS_MODEL ?? 'zai-org/GLM-5.1';

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'FEATHERLESS_API_KEY is not set. Configure it via the app form or .env.',
    });
  }

  const featherless = createOpenAICompatible({
    name: 'featherless',
    baseURL,
    apiKey,
  });

  const result = streamText({
    model: featherless(model),
    messages: body.messages,
  });

  return result.toTextStreamResponse();
});
