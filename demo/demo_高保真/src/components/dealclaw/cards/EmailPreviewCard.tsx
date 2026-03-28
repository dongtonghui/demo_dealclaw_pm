import type { RichCard } from "@/hooks/useChatState";
import { useState } from "react";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

export function EmailPreviewCard({ card, onAction }: Props) {
  const { template, customer, highlights, score } = card.data;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(template);

  // Simulate personalization
  const personalizedBody = editedTemplate.body
    .replace(/\[Name\]/g, "Mike")
    .replace(/\[Company\]/g, customer.company)
    .replace(/\[Location\]/g, customer.location.split(",")[0]);

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>📧</span>
        <span className="text-sm font-medium text-foreground">邮件预览 - 收件箱视图</span>
      </div>
      
      <div className="px-4 py-3 space-y-4">
        {/* Inbox Simulation */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
            📨 Gmail - Inbox
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-start gap-3 p-2 bg-primary/5 rounded border-l-2 border-primary">
              <div className="w-8 h-8 rounded-full bg-agent-email/20 flex items-center justify-center text-xs shrink-0">
                S
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">Sarah Chen</span>
                  <span className="text-xs text-muted-foreground">9:30 AM</span>
                </div>
                <div className="text-sm text-foreground truncate">{editedTemplate.subject}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {personalizedBody.substring(0, 60)}...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">📋 邮件内容</div>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">Subject: </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTemplate.subject}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
                  className="flex-1 bg-muted rounded px-2 py-1 text-sm text-foreground ml-1"
                />
              ) : (
                <span className="text-sm text-foreground">{editedTemplate.subject}</span>
              )}
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm text-secondary-foreground whitespace-pre-wrap">
              {isEditing ? (
                <textarea
                  value={editedTemplate.body}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, body: e.target.value })}
                  className="w-full h-48 bg-transparent resize-none focus:outline-none"
                />
              ) : (
                personalizedBody
              )}
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="border border-agent-email/20 rounded-lg p-3 bg-agent-email/5">
          <div className="text-xs font-medium text-agent-email mb-2">💡 个性化亮点</div>
          <div className="space-y-1">
            {highlights.map((highlight: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-secondary-foreground">
                <span className="text-agent-email">✓</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            专业度评分：<span className="text-agent-email font-medium text-sm">{score}/100</span>
          </div>
          <div className="flex gap-1 text-[10px]">
            <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">✓ 发件人正常</span>
            <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">✓ 主题吸引</span>
            <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">✓ 无垃圾词</span>
          </div>
        </div>
      </div>

      {card.actions && (
        <div className="px-4 py-3 border-t border-border flex gap-2 justify-end">
          {card.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === "edit-email") {
                  setIsEditing(!isEditing);
                } else {
                  onAction(action.id);
                }
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                action.variant === "primary"
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {action.id === "edit-email" && isEditing ? "💾 保存" : action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
