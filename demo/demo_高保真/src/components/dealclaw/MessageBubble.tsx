import type { ChatMessage } from "@/hooks/useChatState";
import { CompanyProfileCard } from "./cards/CompanyProfileCard";
import { CustomerPersonaCard } from "./cards/CustomerPersonaCard";
import { AcquisitionPlanCard } from "./cards/AcquisitionPlanCard";

interface MessageBubbleProps {
  message: ChatMessage;
  onCardAction: (actionId: string) => void;
}

const AGENT_LABELS: Record<string, { label: string; emoji: string }> = {
  supervisor: { label: "主管 Agent", emoji: "🤖" },
  seo: { label: "SEO Agent", emoji: "🔍" },
  email: { label: "Email Agent", emoji: "✉️" },
};

export function MessageBubble({ message, onCardAction }: MessageBubbleProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-mono">
          ⏳ {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.role === "user";
  const agentInfo = message.agent ? AGENT_LABELS[message.agent] : null;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-sm shrink-0 mt-0.5">
          {agentInfo?.emoji ?? "🤖"}
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        {!isUser && agentInfo && (
          <span className="text-[11px] text-muted-foreground mb-1 block">{agentInfo.label}</span>
        )}
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card text-card-foreground rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Rich card */}
        {message.card && (
          <div className="mt-3">
            {message.card.type === "company-profile" && (
              <CompanyProfileCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "customer-persona" && (
              <CustomerPersonaCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "acquisition-plan" && (
              <AcquisitionPlanCard card={message.card} onAction={onCardAction} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
