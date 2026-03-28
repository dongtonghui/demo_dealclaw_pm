import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

const TrendIndicator = ({ change }: { change: string }) => {
  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");
  return (
    <span className={`text-xs ${isPositive ? "text-agent-seo" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
      {change} {isPositive ? "↑" : isNegative ? "↓" : "→"}
    </span>
  );
};

export function DataDashboardCard({ card, onAction }: Props) {
  const { period, leads, highIntent, costPerLead, replyRate, traffic, sourceDistribution, roi, highlights, suggestions } = card.data;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>📊</span>
        <span className="text-sm font-medium text-foreground">获客效果数据看板</span>
      </div>
      
      <div className="px-4 py-3 space-y-4">
        {/* Period */}
        <div className="text-xs text-muted-foreground">
          {period}
        </div>

        {/* Core Metrics */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">📈 核心指标（对比上周）</div>
          <div className="grid grid-cols-2 gap-2">
            <MetricBox 
              label="总线索数" 
              current={leads.current} 
              last={leads.last} 
              change={leads.change} 
            />
            <MetricBox 
              label="高意向线索" 
              current={highIntent.current} 
              last={highIntent.last} 
              change={highIntent.change} 
            />
            <MetricBox 
              label="平均获客成本" 
              current={costPerLead.current} 
              last={costPerLead.last} 
              change={costPerLead.change} 
            />
            <MetricBox 
              label="邮件回复率" 
              current={replyRate.current} 
              last={replyRate.last} 
              change={replyRate.change} 
            />
          </div>
        </div>

        {/* Source Distribution */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">📊 线索来源分布</div>
          <div className="space-y-2">
            <DistributionBar 
              label="Email" 
              percentage={sourceDistribution.email} 
              count={Math.round(leads.current * sourceDistribution.email / 100)}
              color="bg-agent-email" 
            />
            <DistributionBar 
              label="SEO" 
              percentage={sourceDistribution.seo} 
              count={Math.round(leads.current * sourceDistribution.seo / 100)}
              color="bg-agent-seo" 
            />
            <DistributionBar 
              label="其他" 
              percentage={sourceDistribution.other} 
              count={Math.round(leads.current * sourceDistribution.other / 100)}
              color="bg-muted-foreground" 
            />
          </div>
        </div>

        {/* ROI */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">💰 ROI分析</span>
            <span className="text-lg font-semibold text-agent-seo">{roi}</span>
          </div>
          <div className="mt-2 text-xs text-secondary-foreground space-y-1">
            <p>• 本周投入：¥2,744（平台服务费+发送成本）</p>
            <p>• 预估回报：¥12,000（按平均订单¥3,000×转化率15%）</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-agent-seo mb-2">🏆 本周亮点</div>
          <div className="space-y-1">
            {highlights.map((highlight: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-secondary-foreground">
                <span className="text-agent-seo">•</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-primary mb-2">💡 优化建议</div>
          <div className="space-y-1">
            {suggestions.map((suggestion: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-secondary-foreground">
                <span className="text-primary">•</span>
                <span>{suggestion}</span>
              </div>
            ))}
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

function MetricBox({ label, current, last, change }: { label: string; current: string | number; last: string | number; change: string }) {
  return (
    <div className="bg-muted rounded-lg p-2.5">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <span className="text-sm font-semibold text-foreground">{current}</span>
        <TrendIndicator change={change} />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">上周: {last}</div>
    </div>
  );
}

function DistributionBar({ label, percentage, count, color }: { label: string; percentage: number; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-foreground">{percentage}% ({count}条)</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
}
