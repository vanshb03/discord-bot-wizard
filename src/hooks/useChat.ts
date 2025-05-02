import { useState } from 'react';
import { useClaudeApi, ClaudeApiOptions } from '@/hooks/useClaudeApi';

export interface Message {
  content: string;
  role: 'user' | 'assistant';
}

interface UseChatOptions {
  initialMessages?: Message[];
  claudeOptions?: ClaudeApiOptions;
}

export const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>(options.initialMessages || []);
  const [botData, setBotData] = useState<{
    name: string;
    description: string;
    features: { name: string; description: string }[];
  } | null>(null);
  
  const {
    sendMessage: sendToClaudeApi,
    isLoading,
    setApiKey,
    apiKey
  } = useClaudeApi(options.claudeOptions);

  // Process the bot features from Claude's response
  const extractBotData = (content: string): {
    name: string;
    description: string;
    features: { name: string; description: string }[];
  } => {
    try {
      // This is a simplified extraction logic - in a real app, you'd use more robust parsing
      const featureRegex = /- ([^:]+): ([^\n]+)/g;
      const features: { name: string; description: string }[] = [];
      let match;
      
      while ((match = featureRegex.exec(content)) !== null) {
        features.push({
          name: match[1].trim(),
          description: match[2].trim()
        });
      }

      // Extract name
      const nameRegex = /bot called "([^"]+)"/i;
      const nameMatch = content.match(nameRegex);
      const name = nameMatch ? nameMatch[1] : 'DiscordAssistant';

      // Extract description
      const descriptionRegex = /Discord bot that ([^\.]+)/i;
      const descriptionMatch = content.match(descriptionRegex);
      const description = descriptionMatch 
        ? `A Discord bot that ${descriptionMatch[1]}`
        : "A custom Discord bot";

      return {
        name,
        description,
        features: features.length > 0 ? features : [{
          name: 'Custom Commands',
          description: 'Create custom responses to specific commands.'
        }]
      };
    } catch (error) {
      console.error('Error parsing bot data:', error);
      return {
        name: 'DiscordAssistant',
        description: 'A custom Discord bot',
        features: [{
          name: 'Custom Commands',
          description: 'Create custom responses to specific commands.'
        }]
      };
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    try {
      if (apiKey) {
        // Use Claude API
        const claudeMessages = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const response = await sendToClaudeApi(claudeMessages);
        
        if (response) {
          // Add assistant response
          const assistantMessage: Message = { 
            role: 'assistant', 
            content: response.content 
          };
          setMessages(prev => [...prev, assistantMessage]);
          
          // Extract bot data from response
          const newBotData = extractBotData(response.content);
          setBotData(newBotData);
        }
      } else {
        // Fallback to mock response if no API key is set
        await mockGenerateBotResponse(content);
      }
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  // Mock AI response generator as fallback
  const mockGenerateBotResponse = async (userMessage: string) => {
    // Wait for a simulated delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use the existing mock logic
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple logic to extract bot features from the message
    const features = [];
    
    if (lowerMessage.includes('moderation')) {
      features.push({
        name: 'Content Moderation',
        description: 'Automatically filter inappropriate content and warn users.'
      });
    }
    
    if (lowerMessage.includes('music') || lowerMessage.includes('play')) {
      features.push({
        name: 'Music Player',
        description: 'Play music from various sources directly in voice channels.'
      });
    }
    
    if (lowerMessage.includes('welcome') || lowerMessage.includes('greet')) {
      features.push({
        name: 'Welcome Messages',
        description: 'Custom greetings for new members joining your server.'
      });
    }
    
    if (lowerMessage.includes('role') || lowerMessage.includes('assign')) {
      features.push({
        name: 'Role Management',
        description: 'Assign and manage roles through commands or reactions.'
      });
    }
    
    if (features.length === 0) {
      features.push({
        name: 'Custom Commands',
        description: 'Create custom responses to specific commands.'
      });
    }

    // Extract potential bot name
    let botName = "DiscordAssistant";
    if (lowerMessage.includes('name')) {
      const nameMatch = userMessage.match(/name\s+(?:it|the bot|called|as)?\s*["']?([A-Za-z0-9]+)["']?/i);
      if (nameMatch && nameMatch[1]) {
        botName = nameMatch[1];
      }
    }
    
    // Generate a description based on the message
    let description = "A custom Discord bot";
    if (features.length > 0) {
      description = `A Discord bot that ${features.map(f => f.name.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}`;
    }
    
    // Update the bot data
    const newBotData = {
      name: botName,
      description,
      features
    };
    
    setBotData(newBotData);
    
    // Return a response message
    const responseContent = `I can create a Discord bot called "${botName}" with the following features:\n\n${features.map(f => `- ${f.name}: ${f.description}`).join('\n')}\n\nIs this what you're looking for? If you want to make any changes, let me know.`;
    
    setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
  };

  const clearMessages = () => {
    setMessages([]);
    setBotData(null);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    botData,
    setApiKey,
    apiKey
  };
};
