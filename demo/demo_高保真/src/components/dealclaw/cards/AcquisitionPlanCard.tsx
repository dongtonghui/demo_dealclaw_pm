import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

export function AcquisitionPlanCard({ card, onAction }: Props) {
  const { seo, email, summary } = card.data;
  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>📋</span>
        <span className="text-sm font-medium text-foreground">获客方案 - 多渠道整合</span>
      </div>
      <div className="px-4 py-3 space-y-4">
        {/* SEO */}
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-agent-seo mb-2">
            🔍 SEO Agent 策略
          </div>
          <div className="ml-5 space-y-1 text-sm text-secondary-foreground">
            <p>├─ 模式：{seo.mode}</p>
            <p>├─ 目标关键词：{seo.keywords}</p>
            <p>├─ 内容计划：{seo.contentPlan}</p>
            <p>└─ 预期线索：{seo.expectedLeads}</p>
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-agent-email mb-2">
            ✉️ Email Agent 策略
          </div>
          <div className="ml-5 space-y-1 text-sm text-secondary-foreground">
            <p>├─ 发送渠道：{email.channel}</p>
            <p>├─ 目标客户：{email.targetCustomers}</p>
            <p>├─ 发送计划：{email.sendPlan}</p>
            <p>└─ 预期线索：{email.expectedLeads}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-border pt-3">
          <div className="text-sm font-medium text-foreground mb-2">📊 整体预期</div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="获客周期" value={summary.cycle} />
            <Stat label="总线索数" value={summary.totalLeads} />
            <Stat label="预估成本" value={summary.costPerLead} />
            <Stat label="高意向占比" value={summary.highIntent} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
