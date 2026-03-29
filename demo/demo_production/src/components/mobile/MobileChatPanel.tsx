import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MobileChatInput } from "./MobileChatInput";
import { MessageBubble } from "@/components/dealclaw/MessageBubble";
import type { ChatMessage } from "@/hooks/useChatState";
import { cn } from "@/lib/utils";

interface MobileChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onCardAction: (actionId: string, data?: Record<string, any>) => void;
  onFileUpload?: (files: { name: string; size: string; type: string }[]) => void;
  isTyping: boolean;
  className?: string;
}

export function MobileChatPanel({
  messages,
  onSendMessage,
  onCardAction,
  onFileUpload,
  isTyping,
  className,
}: MobileChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Auto scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Handle scroll to show/hide scroll button
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Handle virtual keyboard
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      const heightDiff = window.innerHeight - visualViewport.height;
      setKeyboardHeight(heightDiff > 100 ? heightDiff : 0);
      
      // Scroll to bottom when keyboard opens
      if (heightDiff > 100) {
        setTimeout(scrollToBottom, 100);
      }
    };

    visualViewport.addEventListener("resize", handleResize);
    return () => visualViewport.removeEventListener("resize", handleResize);
  }, [scrollToBottom]);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background",
        className
      )}
      style={{
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
      }}
    >
      {/* Messages Area */}
      <ScrollArea
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 px-4 py-4"
        data-scrollable="true"
      >
        <div className="space-y-4 pb-20">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  delay: index === messages.length - 1 ? 0 : 0,
                }}
              >
                <MobileMessageBubble
                  message={message}
                  onCardAction={onCardAction}
                  isLast={index === messages.length - 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <span className="text-agent-supervisor">🤖</span>
                <div className="flex gap-1 bg-muted rounded-full px-3 py-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10
                       w-8 h-8 rounded-full bg-primary text-primary-foreground
                       shadow-lg flex items-center justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area - Fixed at bottom */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "bg-background/95 backdrop-blur border-t border-border",
          "safe-area-pb"
        )}
        style={{
          bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
        }}
      >
        <MobileChatInput
          onSendMessage={onSendMessage}
          onFileUpload={onFileUpload}
          disabled={isTyping}
        />
      </div>
    </div>
  );
}

// Mobile Message Bubble Wrapper
interface MobileMessageBubbleProps {
  message: ChatMessage;
  onCardAction: (actionId: string, data?: Record<string, any>) => void;
  isLast: boolean;
}

function MobileMessageBubble({
  message,
  onCardAction,
  isLast,
}: MobileMessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        message.role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {message.role === "user" ? (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
            👤
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-agent-supervisor/20 flex items-center justify-center">
            <span className="text-sm">
              {message.agent === "seo"
                ? "🔍"
                : message.agent === "email"
                ? "✉️"
                : message.agent === "whatsapp"
                ? "💬"
                : "🤖"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "max-w-[75%] min-w-0",
          message.role === "user" ? "items-end" : "items-start"
        )}
      >
        {/* Sender Name */}
        {message.role !== "user" && (
          <span className="text-[10px] text-muted-foreground mb-1 block">
            {message.agent === "seo"
              ? "SEO Agent"
              : message.agent === "email"
              ? "Email Agent"
              : message.agent === "whatsapp"
              ? "WhatsApp Agent"
              : "主管 Agent"}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm",
            message.role === "user"
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          {message.content}
        </div>

        {/* Card */}
        {message.card && (
          <div className="mt-2">
            <MobileCard
              card={message.card}
              onAction={onCardAction}
            />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground mt-1 block">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

// Simplified Mobile Card
interface MobileCardProps {
  card: NonNullable<ChatMessage["card"]>;
  onAction: (actionId: string, data?: Record<string, any>) => void;
}

function MobileCard({ card, onAction }: MobileCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Simple card preview based on type
  const cardTitles: Record<string, string> = {
    "company-profile": "🏢 企业画像",
    "customer-persona": "👥 客户画像",
    "acquisition-plan": "🎯 获客方案",
    "seo-strategy": "🔍 SEO策略",
    "seo-article": "📝 SEO文章",
    "lead-summary": "🎯 线索汇总",
    "data-dashboard": "📊 数据看板",
  };

  const title = cardTitles[card.type] || "📋 详情";

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3 flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <svg
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border pt-2">
              {/* Simplified card content */}
              <div className="text-xs text-muted-foreground">
                {Object.entries(card.data).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span>{key}:</span>
                    <span className="text-foreground truncate max-w-[150px]">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {card.actions && card.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {card.actions.slice(0, 2).map((action) => (
                    <button
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(action.id, card.data);
                      }}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-medium",
                        action.variant === "primary"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
