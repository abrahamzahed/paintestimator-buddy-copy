
import { Message } from "@/types";
import { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  height?: string;
}

const MessageList = ({ messages, isTyping, height = "350px" }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className={`overflow-y-auto p-4`} style={{ height }}>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {isTyping && (
        <div className="flex justify-start mb-4">
          <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 animate-pulse">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
