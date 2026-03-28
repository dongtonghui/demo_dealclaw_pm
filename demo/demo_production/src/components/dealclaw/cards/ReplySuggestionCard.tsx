import { useState } from "react";
import type { RichCard, Lead } from "@/hooks/useChatState";
import { Send, RefreshCw, Copy, Check, Sparkles, Lightbulb, Quote } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

export function ReplySuggestionCard({ card, onAction }: Props) {
  const { lead, suggestion } = card.data as { lead: Lead; suggestion: ReplySuggestion };
  const [copied, setCopied] = useState(false);
  const [editedContent, setEditedContent] = useState(suggestion.content);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI回复建议</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          基于 {lead.company} 的互动历史生成的个性化回复
        </p>
      </div>

      {/* Context Info */}
      <div className="px-4 py-2.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏢</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{lead.company}</p>
            <p className="text-xs text-muted-foreground">
              {lead.contactName || "联系人"} · {lead.lastContact || "刚刚"}
            </p>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScoreStyle(lead.score)}`}>
            {lead.score}分
          </div>
        </div>
      </div>

      {/* Reply Content */}
      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">主题行</span>
            <button
              onClick={() => onAction("regenerate-subject", { lead })}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              换一版
            </button>
          </div>
          <div className="px-3 py-2 bg-muted/30 rounded-lg text-sm font-medium">
            {suggestion.subject}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">邮件内容</span>
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
              >
                {isEditing ? "完成" : "编辑"}
              </button>
              <button
                onClick={() => onAction("regenerate-content", { lead })}
                className="text-xs text-primary hover:underline flex items-center gap-1 px-2 py-1"
              >
                <RefreshCw className="w-3 h-3" />
                换一版
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-48 px-3 py-2.5 text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:border-primary font-mono leading-relaxed"
            />
          ) : (
            <div className="px-3 py-2.5 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]">
              {editedContent}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-medium text-muted-foreground">回复亮点</span>
          </div>
          <ul className="space-y-1.5">
            {suggestion.highlights.map((highlight: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-xs">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-secondary-foreground">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Quote className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">发送建议</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{suggestion.tips}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <button
          onClick={() => onAction("send-reply", { lead, subject: suggestion.subject, content: editedContent })}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" />
          发送邮件
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制
            </>
          )}
        </button>
        <button
          onClick={() => onAction("save-draft", { leadId: lead.id, content: editedContent })}
          className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
        >
          存草稿
        </button>
      </div>
    </div>
  );
}

interface ReplySuggestion {
  subject: string;
  content: string;
  highlights: string[];
  tips: string;
}

function getScoreStyle(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-100";
  if (score >= 60) return "text-yellow-600 bg-yellow-100";
  return "text-orange-600 bg-orange-100";
}
