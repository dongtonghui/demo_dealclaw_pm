import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

export function SEOStrategyCard({ card, onAction }: Props) {
  const { keywords, contentPlan, expectations } = card.data;
  
  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>🔍</span>
        <span className="text-sm font-medium text-foreground">SEO内容策略方案</span>
      </div>
      
      <div className="px-4 py-3 space-y-4">
        {/* Keywords */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">🎯 目标关键词（基于您的产品和市场）</div>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted-foreground/10">
                <tr>
                  <th className="px-3 py-2 text-left text-muted-foreground">关键词</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">月搜索量</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">竞争度</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">优先级</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw: any, idx: number) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">{kw.keyword}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">{kw.volume.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">{kw.difficulty === "low" ? "低" : kw.difficulty === "medium" ? "中" : "高"}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs ${kw.priority === "high" ? "text-agent-seo" : "text-muted-foreground"}`}>
                        {kw.priority === "high" ? "⭐⭐⭐ 高" : "⭐⭐ 中"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Plan */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">📝 内容发布计划</div>
          <div className="space-y-1.5">
            {contentPlan.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className={item.status === "已生成" ? "text-agent-seo" : "text-muted-foreground"}>
                  {item.status === "已生成" ? "✓" : "○"}
                </span>
                <span className="text-muted-foreground">第{idx + 1}周：</span>
                <span className={item.status === "已生成" ? "text-foreground" : "text-muted-foreground"}>
                  {item.topic}
                </span>
                {item.status === "已生成" && (
                  <span className="text-[10px] bg-agent-seo/10 text-agent-seo px-1.5 py-0.5 rounded ml-auto">
                    已生成
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expectations */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">📊 预期效果</div>
          <div className="space-y-1 text-sm text-secondary-foreground">
            <p>• {expectations.ranking}</p>
            <p>• {expectations.traffic}</p>
            <p>• {expectations.leads}</p>
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
