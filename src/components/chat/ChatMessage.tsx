
import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`mb-4 flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 animate-fade-in ${
          message.role === "user"
            ? "bg-paint text-white rounded-tr-none"
            : "bg-secondary text-foreground rounded-tl-none"
        }`}
      >
        <div className="whitespace-pre-line">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            message.role === "user"
              ? "text-white/70"
              : "text-muted-foreground"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
