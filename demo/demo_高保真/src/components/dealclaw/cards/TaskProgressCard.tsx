import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

const ProgressBar = ({ progress, color = "bg-primary" }: { progress: number; color?: string }) => (
  <div className="h-2 bg-muted rounded-full overflow-hidden">
    <div 
      className={`h-full ${color} rounded-full transition-all duration-500`} 
      style={{ width: `${progress}%` }} 
    />
  </div>
);

export function TaskProgressCard({ card, onAction }: Props) {
  const { taskName, status, daysRunning, seo, email, leads, suggestion } = card.data;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>📊</span>
        <span className="text-sm font-medium text-foreground">获客任务进度看板</span>
      </div>
      
      <div className="px-4 py-3 space-y-4">
        {/* Task Status */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">{taskName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-agent-seo animate-pulse" />
                {status}
              </span>
              <span className="ml-2">（已运行{daysRunning}天）</span>
            </div>
          </div>
        </div>

        {/* SEO Progress */}
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-agent-seo">
              🔍 SEO Agent
            </div>
            <button className="text-xs text-primary hover:underline">[查看详情]</button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
            <span className="text-secondary-foreground">📄 已发布文章：<span className="text-foreground font-medium">{seo.articlesPublished}篇</span></span>
            <span className="text-secondary-foreground">🎯 关键词排名：<span className="text-foreground font-medium">{seo.keywordsRanked}个进前50</span></span>
            <span className="text-secondary-foreground">👥 自然流量：<span className="text-foreground font-medium">{seo.traffic}访客</span></span>
            <span className="text-secondary-foreground">📈 环比增长：<span className="text-agent-seo font-medium">{seo.growth}</span></span>
          </div>
          <ProgressBar progress={seo.progress} color="bg-agent-seo" />
          <div className="text-right text-[10px] text-muted-foreground mt-1">{seo.progress}%</div>
        </div>

        {/* Email Progress */}
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-agent-email">
              ✉️ Email Agent
            </div>
            <button className="text-xs text-primary hover:underline">[查看详情]</button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
            <span className="text-secondary-foreground">📤 已发送：<span className="text-foreground font-medium">{email.sent}封</span></span>
            <span className="text-secondary-foreground">📬 送达率：<span className="text-foreground font-medium">{email.delivered}%</span></span>
            <span className="text-secondary-foreground">👁️ 打开率：<span className="text-foreground font-medium">{email.opened}%</span></span>
            <span className="text-secondary-foreground">💬 回复率：<span className="text-foreground font-medium">{email.replied}%</span></span>
          </div>
          <ProgressBar progress={email.progress} color="bg-agent-email" />
          <div className="text-right text-[10px] text-muted-foreground mt-1">{email.progress}%</div>
        </div>

        {/* Leads Progress */}
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              🎯 线索收获
            </div>
            <button className="text-xs text-primary hover:underline">[查看全部]</button>
          </div>
          <div className="text-xs mb-2">
            <span className="text-secondary-foreground">
              ✨ 总线索：<span className="text-foreground font-medium">{leads.total}条</span> 
              <span className="text-muted-foreground">（本月目标：{leads.target}条）</span>
            </span>
            <span className="ml-4 text-secondary-foreground">
              🔥 高意向：<span className="text-agent-seo font-medium">{leads.highIntent}条</span> 
              <span className="text-muted-foreground">（{Math.round(leads.highIntent / leads.total * 100)}%）</span>
            </span>
          </div>
          <ProgressBar progress={leads.percentage} color="bg-primary" />
          <div className="text-right text-[10px] text-muted-foreground mt-1">{leads.percentage}% 完成</div>
        </div>

        {/* Suggestion */}
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <div className="flex items-start gap-2">
            <span className="text-primary text-sm">💡</span>
            <span className="text-xs text-secondary-foreground">{suggestion}</span>
          </div>
        </div>
      </div>

      {card.actions && (
        <div className="px-4 py-3 border-t border-border flex gap-2 justify-end">
          {card.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                action.variant === "primary"
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
