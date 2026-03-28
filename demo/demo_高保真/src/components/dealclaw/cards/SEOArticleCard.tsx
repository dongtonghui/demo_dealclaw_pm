import type { RichCard } from "@/hooks/useChatState";
import { useState } from "react";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

export function SEOArticleCard({ card, onAction }: Props) {
  const { title, content, originality, readability, aiScore } = card.data;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>📝</span>
        <span className="text-sm font-medium text-foreground">文章预览</span>
      </div>
      
      <div className="px-4 py-3 space-y-4">
        {/* Title */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">标题</div>
          <div className="bg-muted rounded-lg px-3 py-2 text-sm font-medium text-foreground">
            {title}
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">正文内容</div>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-48 bg-muted rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <div className="bg-muted rounded-lg px-3 py-2 text-sm text-secondary-foreground max-h-48 overflow-y-auto whitespace-pre-wrap">
              {editedContent}
            </div>
          )}
        </div>

        {/* Quality Check */}
        <div className="border border-agent-seo/20 rounded-lg p-3 bg-agent-seo/5">
          <div className="text-xs font-medium text-agent-seo mb-2">✅ 质量检测通过</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-secondary-foreground">
              原创度：<span className="text-agent-seo font-medium">{originality}%</span>
            </span>
            <span className="text-secondary-foreground">
              可读性：<span className="text-agent-seo font-medium">{readability === "good" ? "良好" : readability}</span>
            </span>
            <span className="text-secondary-foreground">
              AI痕迹：<span className="text-agent-seo font-medium">{aiScore === "low" ? "低" : aiScore}</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            预估SEO得分：<span className="text-agent-seo font-medium">82/100</span>
          </div>
        </div>

        {/* Preview Mode */}
        {showPreview && (
          <div className="border border-border rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">👁️ 网站预览效果</div>
            <div className="bg-background border border-border rounded p-3">
              <h1 className="text-lg font-bold text-foreground mb-2">{title}</h1>
              <div className="text-xs text-muted-foreground mb-2">发布日期: 2026-03-28 | 作者: SEO Agent</div>
              <div className="text-sm text-secondary-foreground line-clamp-6">
                {editedContent.substring(0, 300)}...
              </div>
            </div>
          </div>
        )}
      </div>

      {card.actions && (
        <div className="px-4 py-3 border-t border-border flex gap-2 justify-end">
          {card.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === "edit-article") {
                  setIsEditing(!isEditing);
                } else if (action.id === "preview-article") {
                  setShowPreview(!showPreview);
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
              {action.id === "edit-article" && isEditing ? "💾 保存" : action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
