<script setup lang="ts">
type Msg = { role: 'user' | 'assistant'; content: string };

const config = useRuntimeConfig();
const messages = ref<Msg[]>([]);
const input = ref('');
const sending = ref(false);

async function send() {
  const text = input.value.trim();
  if (!text || sending.value) return;

  messages.value.push({ role: 'user', content: text });
  input.value = '';
  sending.value = true;

  const assistantIdx = messages.value.length;
  messages.value.push({ role: 'assistant', content: '' });

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value.slice(0, -1) }),
    });
    if (!res.ok || !res.body) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(err || `HTTP ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      messages.value[assistantIdx].content += decoder.decode(value, { stream: true });
    }
  } catch (e) {
    messages.value[assistantIdx].content = `Error: ${(e as Error).message}`;
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <header class="border-b border-neutral-200 dark:border-neutral-800">
      <div class="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
        <div class="text-teal-600 dark:text-teal-400">
          <img src="/featherless-logo.svg" alt="Featherless" class="w-8 h-8" />
        </div>
        <div>
          <h1 class="text-lg font-semibold">Featherless Nuxt Starter</h1>
          <p class="text-xs text-neutral-500">Model: {{ config.public.defaultModel }}</p>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-8 space-y-4">
      <div v-if="messages.length === 0" class="text-center py-16 text-neutral-500">
        <p class="text-2xl mb-2">Hello, world.</p>
        <p class="text-sm">Type a message below to stream a response from Featherless.</p>
      </div>

      <div v-for="(m, i) in messages" :key="i" class="flex" :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
        <div
          class="max-w-[80%] rounded-2xl px-4 py-2"
          :class="m.role === 'user'
            ? 'bg-teal-600 text-white'
            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'"
        >
          <p class="whitespace-pre-wrap text-sm">{{ m.content || (sending && i === messages.length - 1 ? '…' : '') }}</p>
        </div>
      </div>

      <form class="flex gap-2 pt-4" @submit.prevent="send">
        <UInput v-model="input" placeholder="Ask something..." class="flex-1" :disabled="sending" />
        <UButton type="submit" :loading="sending" :disabled="!input.trim()">Send</UButton>
      </form>
    </main>
  </div>
</template>
