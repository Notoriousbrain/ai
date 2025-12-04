/* eslint-disable no-console */
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

async function searchToolTest() {
  console.log('\n=== SEARCH TOOL TEST ===');

  const claude = createAnthropic({
    advancedToolUse: true,
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // 1. Register runtime tools
  claude.advancedTools.register({
    name: 'weather_lookup',
    description: 'Get weather info',
    inputSchema: {},
    keywords: ['weather', 'forecast', 'temperature'],
    allowedCallers: [],
  });

  claude.advancedTools.register({
    name: 'movie_facts',
    description: 'Movie trivia',
    inputSchema: {},
    keywords: ['movie', 'actor', 'film'],
    allowedCallers: [],
  });

  console.log('Registered tools:', claude.advancedTools.list());

  // 2. Build search tool definition
  const searchTool = claude.searchTool({
    name: 'runtime_tool_search',
    query: 'weather temperature',
    searchType: 'tool_search_bm25_20251119', // <-- FIXED
    maxResults: 2,
    inputExamples: ['forecast', 'rain', 'sunny'],
  });

  // 3. Invoke Claude with the proper ATU structure
  const result = await generateText({
    model: claude('claude-3-haiku-20240307'),

    providerOptions: {
      anthropic: {
        tools: [
          {
            type: 'search-tool',
            name: searchTool.name,
            query: searchTool.query,
            max_results: searchTool.maxResults ?? 3,

            input_examples: searchTool.inputExamples?.map(x =>
              typeof x === 'string' ||
              typeof x === 'number' ||
              typeof x === 'boolean' ||
              x === null
                ? x
                : JSON.stringify(x),
            ),

            allowed_callers: searchTool.allowedCallers ?? [],

            provider_options: {
              anthropic: {
                type: searchTool.searchType, 
              },
            },
          },
        ],
      },
    },

    prompt: 'Search for a relevant tool about weather and call it if helpful.',
  });

  console.log('\nLLM Response:', result.text);
  console.log('\nTool Calls:', result.toolCalls);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY');
  }

  await searchToolTest();
}

main().catch(console.error);
