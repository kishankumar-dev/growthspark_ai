
"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { getAiResponse, getStrategySuggestion, getNewPlaceholder } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, type Message } from '@/components/chat/chat-message';
import { Send, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

const initialMessages: Message[] = [
    { id: '1', role: 'assistant', content: "Hello! I'm your GrowthSpark AI assistant. How can I help you grow your business today?" }
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [placeholder, setPlaceholder] = useState("How can we increase Q3 revenue?");
  const formRef = useRef<HTMLFormElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (lastMessage?.role === 'assistant' && lastMessage.content) {
      const fetchNewPlaceholder = async () => {
        if (lastMessage.content !== 'planning...') {
          const formData = new FormData();
          formData.append('message', lastMessage.content);
          const result = await getNewPlaceholder(formData);
          if (result.placeholder) {
            setPlaceholder(result.placeholder);
          }
        }
      };
      fetchNewPlaceholder();
    }
  }, [lastMessage]);
  
  useEffect(() => {
    if (lastMessage?.role === 'user') {
      const fetchAiResponse = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('userInput', lastMessage.content);
        const result = await getAiResponse(formData);
        setIsLoading(false);

        let finalContent = '';
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
            finalContent = `Sorry, an error occurred: ${result.error}`;
        } else {
            finalContent = result.response!;
        }
        
        const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: finalContent };
        setMessages(prev => [...prev, assistantMessage]);
      };
      fetchAiResponse();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);


  useLayoutEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const formAction = async (formData: FormData) => {
    const userInputText = formData.get('userInput') as string;
    if (!userInputText.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: userInputText };
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
  };

  const handleStrategySuggestion = async () => {
    if (isLoading) return;

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const topic = lastUserMessage?.content || "general business growth";
    
    setIsLoading(true);
    const loadingMessageId = crypto.randomUUID();
    const loadingMessage: Message = { id: loadingMessageId, role: 'assistant', content: 'planning...' };
    setMessages(prev => [...prev, loadingMessage]);

    const formData = new FormData();
    formData.append('topic', `Generate business strategies for: ${topic}`);
    const result = await getStrategySuggestion(formData);
    
    setIsLoading(false);

    let finalContent = '';
    if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        finalContent = `Sorry, an error occurred: ${result.error}`;
    } else {
        finalContent = result.response!;
    }
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === loadingMessageId) {
        return { ...msg, content: finalContent };
      }
      return msg;
    }));
  };

  const clearChat = () => {
    setMessages(initialMessages);
    setPlaceholder("How can we increase Q3 revenue?");
    toast({
        title: "Chat Cleared",
        description: "The conversation has been reset.",
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
    } else if (e.key === 'Tab' && placeholder) {
        e.preventDefault();
        setUserInput(placeholder);
    }
  };

  return (
    <Card className="w-full max-w-3xl h-[90vh] md:h-[85vh] flex flex-col shadow-2xl rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <span className="p-2 bg-accent/10 rounded-full text-accent"><Sparkles /></span>
            GrowthSpark AI
          </CardTitle>
          <CardDescription>Your AI-powered business growth co-pilot.</CardDescription>
        </div>
        <ThemeToggle />
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
           <div className="p-4 space-y-4">
              {messages.map((m) => <ChatMessage key={m.id} message={m} />)}
              {isLoading && !messages.find(m => m.content === 'planning...') && (
                <ChatMessage message={{id: 'loading', role: 'assistant', content: '...'}} />
              )}
           </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-col gap-3">
        <div className="flex w-full items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleStrategySuggestion} disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4 text-accent" />
                Suggest Strategies
            </Button>
             <Button variant="ghost" size="sm" onClick={clearChat} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4 text-accent" />
                Clear Chat
            </Button>
        </div>
        <form action={formAction} ref={formRef} className="flex w-full items-start gap-2">
          <Textarea
            name="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={placeholder}
            className="resize-none flex-1"
            rows={1}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
          />
          <Button type="submit" size="icon" disabled={isLoading} aria-label="Send message">
            {isLoading ? <Loader2 className="animate-spin" /> : <Send className="text-accent" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
