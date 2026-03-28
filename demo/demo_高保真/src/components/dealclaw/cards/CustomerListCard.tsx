import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

export function CustomerListCard({ card, onAction }: Props) {
  const { total, conditions, customers, strategy } = card.data;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>✉️</span>
        <span className="text-sm font-medium text-foreground">目标客户列表（共匹配 {total} 家企业）</span>
      </div>
      
      <div className="px-4 py-3 space-y-4">
        {/* Filter Conditions */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">📊 筛选条件</div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded">地区：{conditions.region}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded">行业：{conditions.industry}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded">规模：{conditions.size}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded">年采购：{conditions.purchase}</span>
          </div>
        </div>

        {/* High Intent Customers */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">🎯 高意向客户推荐（AI评分 85+）</div>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted-foreground/10">
                <tr>
                  <th className="px-3 py-2 text-left text-muted-foreground">公司名</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">地区</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">规模</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">评分</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 5).map((customer: any, idx: number) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground font-medium">{customer.company}</td>
                    <td className="px-3 py-2 text-muted-foreground">{customer.location}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">{customer.size}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-medium ${customer.score >= 90 ? "text-agent-seo" : "text-agent-email"}`}>
                        {customer.score}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button className="text-xs text-primary hover:underline">查看邮件</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategy */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">📈 发送策略建议</div>
          <div className="space-y-1 text-sm text-secondary-foreground">
            <p>• 目标客户：{strategy.targetCount}家（已按评分排序）</p>
            <p>• 发送计划：每日{strategy.dailySend}封，持续{strategy.duration}天</p>
            <p>• 发送时间：{strategy.time}</p>
            <p>• 发送渠道：{strategy.channel}</p>
          </div>
        </div>

        {/* Send Calendar Preview */}
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">📅 发送日历预览</div>
          <div className="grid grid-cols-7 gap-1 text-[10px]">
            {["4/1", "4/2", "4/3", "4/4", "4/5", "4/6", "4/7"].map((date, idx) => (
              <div key={idx} className={`text-center p-1 rounded ${idx < 3 ? "bg-agent-email/20 text-agent-email" : "text-muted-foreground"}`}>
                <div>{date}</div>
                <div className="font-medium">{idx < 3 ? "30封" : "-"}</div>
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
