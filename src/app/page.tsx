import { ChatInterface } from '@/components/chat/chat-interface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-2 sm:p-4">
      <ChatInterface />
    </main>
  );
}
