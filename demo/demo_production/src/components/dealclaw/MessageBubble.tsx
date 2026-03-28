import type { ChatMessage } from "@/hooks/useChatState";
import { CompanyProfileCard } from "./cards/CompanyProfileCard";
import { CustomerPersonaCard } from "./cards/CustomerPersonaCard";
import { AcquisitionPlanCard } from "./cards/AcquisitionPlanCard";
import { SEOStrategyCard } from "./cards/SEOStrategyCard";
import { SEOArticleCard } from "./cards/SEOArticleCard";
import { CustomerListCard } from "./cards/CustomerListCard";
import { EmailPreviewCard } from "./cards/EmailPreviewCard";
import { LeadSummaryCard } from "./cards/LeadSummaryCard";
import { DataDashboardCard } from "./cards/DataDashboardCard";
import { TaskProgressCard } from "./cards/TaskProgressCard";

interface MessageBubbleProps {
  message: ChatMessage;
  onCardAction: (actionId: string) => void;
}

const AGENT_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  supervisor: { label: "主管 Agent", emoji: "🤖", color: "text-agent-supervisor" },
  seo: { label: "SEO Agent", emoji: "🔍", color: "text-agent-seo" },
  email: { label: "Email Agent", emoji: "✉️", color: "text-agent-email" },
  whatsapp: { label: "WhatsApp Agent", emoji: "💬", color: "text-agent-whatsapp" },
  lead: { label: "线索 Agent", emoji: "🎯", color: "text-primary" },
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
        <div className={`w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-sm shrink-0 mt-0.5 ${agentInfo?.color || ""}`}>
          {agentInfo?.emoji ?? "🤖"}
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        {!isUser && agentInfo && (
          <span className={`text-[11px] mb-1 block ${agentInfo.color}`}>{agentInfo.label}</span>
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
            {message.card.type === "seo-strategy" && (
              <SEOStrategyCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "seo-article" && (
              <SEOArticleCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "customer-list" && (
              <CustomerListCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "email-preview" && (
              <EmailPreviewCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "lead-summary" && (
              <LeadSummaryCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "data-dashboard" && (
              <DataDashboardCard card={message.card} onAction={onCardAction} />
            )}
            {message.card.type === "task-progress" && (
              <TaskProgressCard card={message.card} onAction={onCardAction} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
