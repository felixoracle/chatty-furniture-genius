
import { Message } from "@/types/chat";
import { Avatar } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const formattedTime = formatDistance(message.timestamp, new Date(), { 
    addSuffix: true,
    locale: es
  });

  return (
    <div className={`flex items-start gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 bg-pity/10">
          <img src="/lovable-uploads/f08dc7af-8397-42a9-b61e-e34abb988be2.png" alt="Pity" className="h-8 w-8 object-contain" />
        </Avatar>
      )}
      <div className={isUser ? "message-bubble-user" : "message-bubble-assistant"}>
        <div className="text-sm whitespace-pre-wrap">
          {message.content.split('\n').map((text, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {text}
            </p>
          ))}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0 bg-primary/10">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground">
            U
          </div>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
