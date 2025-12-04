import { SharedV3ProviderMetadata } from '@ai-sdk/provider';
import { AnthropicSearchToolType } from './anthropic-messages-options';

export interface AnthropicSearchToolDefinition {
  type: 'search-tool';
  name: string;
  query: string;
  maxResults?: number;
  searchType: AnthropicSearchToolType;
  deferLoading?: boolean;
  inputExamples?: unknown[];
  allowedCallers?: string[];
  providerOptions?: SharedV3ProviderMetadata;
}

// FIXED VERSION
export function createSearchToolDefinition(
  def: Omit<AnthropicSearchToolDefinition, 'type'>,
): AnthropicSearchToolDefinition {
  return {
    type: 'search-tool', // ALWAYS constant
    name: def.name,
    query: def.query,
    maxResults: def.maxResults ?? 3,
    searchType: def.searchType,
    inputExamples: def.inputExamples ?? [],
    allowedCallers: def.allowedCallers ?? [],
    deferLoading: def.deferLoading ?? false,
    providerOptions: {
      anthropic: {
        // internal “variant”
        type: def.searchType,
      },
      ...(def.providerOptions ?? {}),
    },
  };
}
