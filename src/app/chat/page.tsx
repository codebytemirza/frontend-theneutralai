"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, User, LogOut, Brain, MessageCircle, Volume2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService } from "@/lib/api-service";

interface Message {
  text: string;
  sender: "user" | "ai";
  timestamp?: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const userToken = localStorage.getItem("userToken");
    const email = localStorage.getItem("userEmail");

    if (!userToken) {
      router.replace("/login");
      return;
    }

    setUserEmail(email || "");
    setUserId(email || "guest");
    setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    router.replace("/login");
  };

  // ✅ FIXED: Properly handle streaming response
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage: Message = { 
      text: input, 
      sender: "user",
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsAiTyping(true);

    try {
      const response = await apiService.streamChat(currentInput, userId);

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              
              if (data.type === "status") {
                // Optional: Handle status messages
                console.log("Status:", data.message);
              } else if (data.type === "answer") {
                // ✅ The content is the FULL answer, not incremental
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.sender === "ai" && aiMessageAdded) {
                    // Update existing AI message with full content
                    return [...prev.slice(0, -1), { 
                      text: data.content,  // ✅ Replace, don't concatenate
                      sender: "ai",
                      timestamp: last.timestamp 
                    }];
                  } else {
                    // Add new AI message
                    aiMessageAdded = true;
                    return [...prev, { 
                      text: data.content, 
                      sender: "ai",
                      timestamp: new Date()
                    }];
                  }
                });
              } else if (data.type === "complete") {
                console.log("Chat completed with thread_id:", data.thread_id);
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.error("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to stream AI response:", error);
      setMessages((prev) => [
        ...prev,
        { 
          text: "Sorry, I'm having trouble responding right now. Please try again.", 
          sender: "ai",
          timestamp: new Date()
        },
      ]);
    } finally {
      setIsAiTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleSpeak = async (text: string, messageId: string) => {
    if (isSpeaking === messageId) {
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(messageId);
    try {
      const response = await apiService.textToSpeech(text);

      if (!response.ok) {
        throw new Error("Failed to get audio stream");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(null);
        URL.revokeObjectURL(audioUrl);
        console.error("Error playing audio");
      };

      await audio.play();
      
    } catch (error) {
      console.error("Speech error:", error);
      setIsSpeaking(null);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setIsAiTyping(false);
    setIsSpeaking(null);
  };

  const renderMessage = (message: Message, index: number) => {
    const messageId = `msg-${index}`;
    return (
      <div
        key={index}
        className={cn(
          "flex gap-3 w-full",
          message.sender === "user" ? "justify-end" : "justify-start"
        )}
      >
        {message.sender === "ai" && (
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-black border-2 border-gray-300">
            <Image 
              src="/media/logo.jpg" 
              alt="AI" 
              width={32} 
              height={32} 
              className="rounded-full w-full h-full object-cover"
              priority
            />
          </div>
        )}
        
        <div className={cn(
          "flex flex-col max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]",
          message.sender === "user" ? "items-end" : "items-start"
        )}>
          <div className="relative">
            <div
              className={cn(
                "rounded-2xl px-4 py-3",
                message.sender === "user"
                  ? "bg-black text-white rounded-tr-sm border border-gray-800"
                  : "bg-white text-black rounded-tl-sm border-2 border-gray-200"
              )}
            >
              {message.sender === "ai" && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full hover:bg-gray-100",
                      isSpeaking === messageId && "text-blue-500"
                    )}
                    onClick={() => handleSpeak(message.text, messageId)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {message.sender === "ai" ? (
                <div className="prose prose-sm sm:prose-base prose-neutral max-w-none pr-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => (
                        <p className="mb-3 last:mb-0 leading-relaxed text-gray-800" {...props} />
                      ),
                      h1: ({node, ...props}) => (
                        <h1 className="text-2xl font-bold mb-3 mt-6 first:mt-0 pb-2 border-b-2 border-gray-300 text-black" {...props} />
                      ),
                      code: ({node, className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        
                        if (!match) {
                          return (
                            <code 
                              className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-black border border-gray-300" 
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        
                        return (
                          <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-300">
                            <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-300">
                              <span className="text-xs text-gray-700 font-mono uppercase font-semibold">{match[1]}</span>
                            </div>
                            <div className="max-w-full overflow-x-auto">
                              <SyntaxHighlighter
                                style={oneLight}
                                language={match[1]}
                                PreTag="div"
                                className="!mt-0 !mb-0 text-sm !bg-white"
                                customStyle={{
                                  margin: 0,
                                  padding: '1rem',
                                }}
                                {...props}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        );
                      },
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                  {message.text}
                </p>
              )}
            </div>
          </div>
          {message.timestamp && (
            <span className="text-xs text-gray-500 mt-1 px-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {message.sender === "user" && (
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-gray-800">
            <User className="h-5 w-5 text-black" />
          </div>
        )}
      </div>
    );
  };

  const WelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="mb-8 relative">
        <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center border-4 border-gray-300 shadow-xl">
          <Brain className="h-10 w-10 text-white" />
        </div>
      </div>
      <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-black">
        Welcome to Neutral Chat
      </h2>
      <p className="text-gray-600 mb-10 max-w-lg text-base sm:text-lg leading-relaxed">
        A balanced space for clear thinking and thoughtful conversations. Ask me anything about ideas, concepts, decisions, or perspectives.
      </p>
    </div>
  );

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b-2 border-gray-200 p-3 sm:p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-gray-300">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold text-black">
              Neutral Chat
            </h1>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Balanced Thinking Assistant
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="hidden sm:flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleNewChat}
            className="sm:hidden"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          <span className="hidden sm:block text-sm text-gray-600 font-medium truncate max-w-[200px]">
            {userEmail}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollAreaRef} className="min-h-full">
            {messages.length === 0 && !isAiTyping ? (
              <WelcomeMessage />
            ) : (
              <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-5xl mx-auto">
                {messages.map((message, index) => renderMessage(message, index))}
                {isAiTyping && (
                  <div className="flex gap-3 w-full justify-start">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border-2 border-gray-300">
                      <Image 
                        src="/media/logo.jpg" 
                        alt="AI" 
                        width={32} 
                        height={32} 
                        className="rounded-full w-full h-full object-cover"
                        priority
                      />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-6 py-4 bg-white border-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-2 w-2 rounded-full bg-black animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="border-t-2 border-gray-200 p-3 sm:p-4 bg-white">
        <form onSubmit={handleSend} className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts..."
              autoComplete="off"
              disabled={isAiTyping}
              className="pr-12 py-6 rounded-2xl border-2 border-gray-300"
            />
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={isAiTyping || !input.trim()}
            className="h-12 w-12 rounded-xl bg-black hover:bg-gray-800"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}