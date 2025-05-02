
import React, { useState } from 'react';
import { Logo } from '@/components/Logo';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { BotPreview } from '@/components/BotPreview';
import { DeploymentStatus } from '@/components/DeploymentStatus';
import { useChat } from '@/hooks/useChat';
import { useDeployment } from '@/hooks/useDeployment';
import { ArrowRightIcon } from 'lucide-react';

const WELCOME_MESSAGE = "Hi! I'm the Discord Bot Wizard. Describe what kind of Discord bot you want to create, and I'll help you build it without writing any code.";

const Index = () => {
  const [step, setStep] = useState<'chat' | 'preview' | 'deployment'>('chat');
  
  // Chat state
  const { messages, isLoading, sendMessage, botData } = useChat({
    initialMessages: [{ role: 'assistant', content: WELCOME_MESSAGE }]
  });
  
  // Deployment state
  const { 
    status: deploymentStatus, 
    deployBot, 
    reset: resetDeployment 
  } = useDeployment({
    onComplete: () => {
      // In a real app, we would redirect to a bot management page
    }
  });

  const handleConfirmBot = () => {
    setStep('deployment');
    if (botData) {
      deployBot(botData);
    }
  };

  const handleEditBot = () => {
    setStep('chat');
  };

  const handleDeploymentDone = () => {
    resetDeployment();
    setStep('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-discord-darkest">
      {/* Header */}
      <header className="border-b border-secondary p-4">
        <Logo />
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
        {step === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto chat-scrollbar mb-4 space-y-2">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.content}
                  isUser={message.role === 'user'}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-center my-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-discord-blurple rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-discord-blurple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-discord-blurple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Describe your ideal Discord bot</span>
                {botData && (
                  <button 
                    onClick={() => setStep('preview')}
                    className="flex items-center gap-1 text-discord-blurple hover:underline text-sm"
                  >
                    Preview Bot <ArrowRightIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
              <ChatInput 
                onSubmit={sendMessage}
                isLoading={isLoading}
                placeholder="e.g., I need a moderation bot that can welcome new users..."
              />
            </div>
          </>
        )}
        
        {step === 'preview' && botData && (
          <div className="flex-1 flex items-center justify-center">
            <BotPreview
              name={botData.name}
              description={botData.description}
              features={botData.features}
              onConfirm={handleConfirmBot}
              onEdit={handleEditBot}
            />
          </div>
        )}
        
        {step === 'deployment' && botData && (
          <div className="flex-1 flex items-center justify-center">
            <DeploymentStatus 
              status={deploymentStatus as any}
              botName={botData.name}
              onDone={handleDeploymentDone}
            />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-secondary p-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Discord Bot Wizard. This is a demo application.
        </p>
      </footer>
    </div>
  );
};

export default Index;
