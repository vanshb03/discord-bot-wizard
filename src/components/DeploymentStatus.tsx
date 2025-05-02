
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Status = 'preparing' | 'deploying' | 'complete' | 'error';

interface DeploymentStatusProps {
  status: Status;
  botName: string;
  onDone?: () => void;
  errorMessage?: string;
}

export const DeploymentStatus = ({ 
  status, 
  botName,
  onDone,
  errorMessage = "An error occurred during deployment."
}: DeploymentStatusProps) => {
  const getStatusContent = () => {
    switch (status) {
      case 'preparing':
        return {
          title: "Preparing Deployment",
          badge: <Badge className="bg-discord-yellow text-black">Preparing</Badge>,
          message: `Setting up ${botName} for deployment...`,
          showLoader: true
        };
      case 'deploying':
        return {
          title: "Deploying Bot",
          badge: <Badge className="bg-discord-blurple">Deploying</Badge>,
          message: `Deploying ${botName} to Cloud Run...`,
          showLoader: true
        };
      case 'complete':
        return {
          title: "Deployment Complete",
          badge: <Badge className="bg-discord-green">Complete</Badge>,
          message: `${botName} has been successfully deployed!`,
          showLoader: false,
          showButton: true
        };
      case 'error':
        return {
          title: "Deployment Failed",
          badge: <Badge className="bg-discord-red">Error</Badge>,
          message: errorMessage,
          showLoader: false,
          showButton: true
        };
      default:
        return {
          title: "Unknown Status",
          badge: <Badge>Unknown</Badge>,
          message: "Unknown deployment status",
          showLoader: false
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <Card className="w-full border-secondary bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-discord-white">{statusContent.title}</CardTitle>
        {statusContent.badge}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-400">{statusContent.message}</p>
        
        {statusContent.showLoader && (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 border-4 border-discord-blurple border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {statusContent.showButton && onDone && (
          <Button 
            onClick={onDone} 
            className="w-full bg-discord-blurple hover:bg-discord-blurple/80"
          >
            {status === 'complete' ? 'View Bot Details' : 'Try Again'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
