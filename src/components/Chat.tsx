
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message, ProductSuggestion } from "@/types/chat";
import { sendMessageToGemini } from "@/services/gemini";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import ProductSuggestions from "./ProductSuggestions";
import ApiKeyInput from "./ApiKeyInput";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial greeting from Pity
  useEffect(() => {
    if (apiKey && messages.length === 0) {
      const initialGreeting: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Hi there! I'm Pity, your friendly furniture assistant. What kind of furniture are you looking for today? I can help you find the perfect piece for your space.",
        timestamp: new Date(),
      };
      setMessages([initialGreeting]);
    }
  }, [apiKey]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Determine if we should generate product suggestions
      const shouldGenerateProducts = messages.length >= 6 && !products.length;
      
      // Send to Gemini API
      const response = await sendMessageToGemini(
        apiKey, 
        [...messages, userMessage],
        shouldGenerateProducts
      );

      // Add assistant response
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Set product suggestions if any were generated
      if (response.products && response.products.length > 0) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRequestNewSuggestions = async () => {
    if (isTyping || messages.length === 0) return;
    
    setIsTyping(true);
    
    try {
      // Request new product suggestions based on existing conversation
      const response = await sendMessageToGemini(apiKey, messages, true);
      
      if (response.products && response.products.length > 0) {
        setProducts(response.products);
        
        // Add assistant message about new suggestions
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: "I've found some new furniture suggestions for you based on our conversation. Take a look!",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast({
          title: "No Suggestions",
          description: "I couldn't generate new suggestions. Let's continue our conversation to refine your preferences.",
        });
      }
    } catch (error) {
      console.error("Error generating new suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to generate new suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setProducts([]);
    setIsTyping(false);
    
    // Re-add initial greeting after short delay
    setTimeout(() => {
      const initialGreeting: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Hi there! I'm Pity, your friendly furniture assistant. What kind of furniture are you looking for today? I can help you find the perfect piece for your space.",
        timestamp: new Date(),
      };
      setMessages([initialGreeting]);
    }, 100);
  };

  const handleChangeApiKey = () => {
    setApiKey("");
    setMessages([]);
    setProducts([]);
  };

  // If API key is not set, show the API key input screen
  if (!apiKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <img 
            src="/lovable-uploads/ad4e2b94-a5d9-4d13-9400-a076a9a18670.png" 
            alt="Pity Logo" 
            className="h-12 mb-4" 
          />
          <h1 className="text-2xl font-bold mb-2">Welcome to Pity</h1>
          <p className="text-muted-foreground max-w-md">
            Your conversational furniture assistant that helps you find the perfect pieces for your space.
          </p>
        </div>
        <ApiKeyInput onSave={setApiKey} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader onReset={handleReset} onChangeApiKey={handleChangeApiKey} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        {products.length > 0 && (
          <ProductSuggestions 
            products={products} 
            onRequestNewSuggestions={handleRequestNewSuggestions} 
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="sticky bottom-0 bg-background border-t">
        <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
      </div>
    </div>
  );
};

export default Chat;
