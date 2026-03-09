import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface EdgeMessage {
  role: 'user' | 'assistant';
  content: string;
}

type ClientLogLevel = 'INFO' | 'WARN' | 'ERROR';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sessionStateRef = useRef<Record<string, unknown> | null>(null);
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const logClient = (
    level: ClientLogLevel,
    step: string,
    message: string,
    requestId?: string,
    meta?: Record<string, unknown>
  ) => {
    const payload = {
      ts: new Date().toISOString(),
      level,
      step,
      requestId: requestId || 'n/a',
      message,
      ...(meta ? { meta } : {}),
    };

    if (level === 'ERROR') {
      console.error('[chatbot-client]', payload);
    } else if (level === 'WARN') {
      console.warn('[chatbot-client]', payload);
    } else {
      console.log('[chatbot-client]', payload);
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sessionStateRef.current = null;
      sessionIdRef.current =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      // Send initial empty message to get greeting
      sendMessage('hola', true);
    }
    if (!isOpen) {
      sessionStateRef.current = null;
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string, isInit = false) => {
    if (!text.trim() || isLoading) return;

    const requestId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!isInit) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
    }

    setInputValue('');
    setIsLoading(true);

    try {
      logClient('INFO', 'request.start', 'Sending request to chatbot edge function', requestId, {
        isInit,
        hasSessionState: !!sessionStateRef.current,
        sessionId: sessionIdRef.current,
        messageLength: text.trim().length,
      });

      const conversationMessages: EdgeMessage[] = [
        ...messages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
        {
          role: 'user',
          content: text.trim(),
        },
      ];

      logClient('INFO', 'request.payload_ready', 'Built edge payload', requestId, {
        messagesCount: conversationMessages.length,
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          sessionId: sessionIdRef.current,
        }),
      });

      logClient('INFO', 'request.response', 'Received response from edge function', requestId, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const rawResponseText = await response.text();
      let data: Record<string, unknown> = {};

      try {
        data = rawResponseText ? JSON.parse(rawResponseText) : {};
        logClient('INFO', 'request.parse_response', 'Parsed response JSON successfully', requestId, {
          keys: Object.keys(data),
        });
      } catch (parseError) {
        logClient('ERROR', 'request.parse_response_failed', 'Failed to parse response JSON', requestId, {
          rawResponseText,
          error:
            parseError instanceof Error
              ? { name: parseError.name, message: parseError.message, stack: parseError.stack }
              : { message: String(parseError) },
        });
      }

      if (!response.ok) {
        logClient('ERROR', 'request.failed', 'Edge function returned error response', requestId, {
          status: response.status,
          responseData: data,
        });

        throw new Error(
          (typeof data.error === 'string' && data.error) ||
            (typeof data.message === 'string' && data.message) ||
            `Failed with status ${response.status}`
        );
      }

      // Store session state for next message
      if (data.sessionState && typeof data.sessionState === 'object') {
        sessionStateRef.current = data.sessionState as Record<string, unknown>;
      }

      logClient('INFO', 'request.success', 'Edge function call completed successfully', requestId, {
        hasMessage: typeof data.message === 'string',
        hasSessionState: !!data.sessionState,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          (typeof data.message === 'string' && data.message) ||
          'Sorry, I could not process your request.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      logClient('ERROR', 'request.exception', 'Unhandled client error while sending message', requestId, {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : { message: String(error) },
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error. Please try again. / Lo siento, hubo un error. Intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-24 z-40 w-96 h-[400px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-primary text-white">
            <h3 className="font-semibold">💈 Royal Studio</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary-dark h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Escribe tu mensaje... / Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-24 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </>
  );
};

export default ChatbotWidget;
