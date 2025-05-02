
import { useState } from 'react';

export interface Message {
  content: string;
  role: 'user' | 'assistant';
}

interface UseChatOptions {
  initialMessages?: Message[];
  // In a real app, we would connect to Claude API
  // apiKey?: string;
}

export const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>(options.initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [botData, setBotData] = useState<{
    name: string;
    description: string;
    features: { name: string; description: string }[];
  } | null>(null);

  // Mock AI response generator - in a real app, this would call Claude API
  const mockGenerateBotResponse = async (userMessage: string) => {
    // Wait for a simulated delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple logic for demo purposes
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
    return `I can create a Discord bot called "${botName}" with the following features:\n\n${features.map(f => `- ${f.name}: ${f.description}`).join('\n')}\n\nIs this what you're looking for? If you want to make any changes, let me know.`;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get response from mock Claude API
      const responseContent = await mockGenerateBotResponse(content);
      
      // Add assistant response
      const assistantMessage: Message = { role: 'assistant', content: responseContent };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
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
    botData
  };
};
