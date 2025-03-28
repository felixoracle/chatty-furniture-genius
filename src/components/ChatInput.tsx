
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatInput = ({ onSendMessage, isTyping }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isTyping) return;
    
    onSendMessage(message.trim());
    setMessage("");
    
    // Focus back on the textarea after sending
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSendMessage} className="flex items-end gap-2 p-2">
      <Textarea
        ref={textareaRef}
        placeholder="Pregunta a Pity sobre muebles..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isTyping}
        className="min-h-[50px] max-h-[150px] resize-none"
        rows={1}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!message.trim() || isTyping}
        className="h-[50px] w-[50px] shrink-0"
      >
        <SendHorizontal size={20} />
      </Button>
    </form>
  );
};

export default ChatInput;
