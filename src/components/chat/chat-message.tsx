"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isLoading = message.content === 'planning...' || message.content === '...';
  const isStreaming = message.role === 'assistant' && message.content.length === 0;

  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-accent/10 text-accent">
            <Sparkles className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] p-3 rounded-lg shadow-sm prose prose-sm prose-p:my-0 break-words transition-all duration-300 dark:prose-invert",
          "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
          isUser
            ? "bg-background border text-foreground"
            : "bg-card border text-card-foreground dark:border-border",
          (isLoading || isStreaming) ? "min-h-[44px] animate-pulse" : "opacity-100"
        )}
      >
        {(isLoading || isStreaming)
          ? <div className="flex items-center gap-2 font-medium"><Loader2 className="h-4 w-4 animate-spin" /> {isStreaming ? 'Thinking...' : (message.content === '...' ? 'Thinking...' : 'Planning...')}</div>
          : <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
        }
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
