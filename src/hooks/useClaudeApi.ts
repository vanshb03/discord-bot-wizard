
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types for Claude API
export interface ClaudeApiOptions {
  apiKey: string;
  model?: string;
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  id: string;
  content: string;
  model: string;
}

export const useClaudeApi = (options?: ClaudeApiOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>(options?.apiKey || '');
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const sendMessage = async (messages: ClaudeMessage[], modelOverride?: string) => {
    if (!apiKey) {
      const error = new Error('Claude API key is required');
      setError(error);
      toast({
        title: "API Key Required",
        description: "Please provide a Claude API key to continue",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelOverride || options?.model || 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to connect to Claude API: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data as ClaudeResponse;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      toast({
        title: "API Error",
        description: errorObj.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    setApiKey,
    apiKey
  };
};
