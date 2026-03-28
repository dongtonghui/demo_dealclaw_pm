import type { RichCard, Lead } from "@/hooks/useChatState";
import { useState } from "react";
import { Mail, Search, MessageCircle } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

const SourceIcon = ({ source }: { source: string }) => {
  switch (source) {
    case "email":
      return <Mail className="w-3 h-3 text-agent-email" />;
    case "seo":
      return <Search className="w-3 h-3 text-agent-seo" />;
    case "whatsapp":
      return <MessageCircle className="w-3 h-3 text-agent-whatsapp" />;
    default:
      return null;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: "bg-primary/10", text: "text-primary", label: "新线索" },
    contacted: { bg: "bg-agent-email/10", text: "text-agent-email", label: "已联系" },
    following: { bg: "bg-agent-seo/10", text: "text-agent-seo", label: "跟进中" },
    converted: { bg: "bg-green-500/10", text: "text-green-500", label: "已转化" },
  };
  const c = config[status] || config.new;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

export function LeadSummaryCard({ card, onAction }: Props) {
  const { total, new: newCount, highIntent, leads } = card.data;
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  if (selectedLead) {
    return (
      <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span className="text-sm font-medium text-foreground">线索详情</span>
          </div>
          <button 
            onClick={() => setSelectedLead(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← 返回列表
          </button>
        </div>
        
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-base font-medium text-foreground">{selectedLead.company}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                📍 {selectedLead.location} | 🏭 {selectedLead.industry} | 👥 {selectedLead.size}
              </div>
            </div>
            <StatusBadge status={selectedLead.status} />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">评分: </span>
              <span className={`font-medium ${selectedLead.score >= 80 ? "text-agent-seo" : "text-foreground"}`}>
                {selectedLead.score}/100
              </span>
            </div>
            <div className="flex items-center gap-1">
              <SourceIcon source={selectedLead.source} />
              <span className="text-muted-foreground capitalize">{selectedLead.source}</span>
            </div>
          </div>

          {selectedLead.interactions && selectedLead.interactions.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">💬 互动历史</div>
              <div className="space-y-1.5">
                {selectedLead.interactions.map((interaction, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      {interaction.timestamp.split(" ")[0]}
                    </span>
                    <span className="text-secondary-foreground">
                      {interaction.details}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button className="flex-1 bg-primary text-primary-foreground text-xs py-2 rounded-lg hover:opacity-90">
              💬 生成回复
            </button>
            <button className="flex-1 bg-muted text-muted-foreground text-xs py-2 rounded-lg hover:text-foreground">
              📝 添加备注
            </button>
            <button className="flex-1 bg-muted text-muted-foreground text-xs py-2 rounded-lg hover:text-foreground">
              ⏰ 稍后提醒
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>🎯</span>
        <span className="text-sm font-medium text-foreground">线索收件箱</span>
        <span className="ml-auto text-xs text-muted-foreground">共 {total} 条</span>
      </div>
      
      <div className="px-4 py-3 space-y-3">
        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-primary/5 rounded-lg p-2 text-center">
            <div className="text-lg font-semibold text-primary">{newCount}</div>
            <div className="text-[10px] text-muted-foreground">新线索</div>
          </div>
          <div className="flex-1 bg-agent-seo/5 rounded-lg p-2 text-center">
            <div className="text-lg font-semibold text-agent-seo">{highIntent}</div>
            <div className="text-[10px] text-muted-foreground">高意向</div>
          </div>
        </div>

        {/* Lead List */}
        <div className="space-y-2">
          {leads.slice(0, 3).map((lead: Lead) => (
            <div 
              key={lead.id} 
              onClick={() => setSelectedLead(lead)}
              className="bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {lead.status === "new" && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1 rounded">NEW</span>
                  )}
                  <span className="text-sm font-medium text-foreground">{lead.company}</span>
                </div>
                <span className={`text-xs font-medium ${lead.score >= 80 ? "text-agent-seo" : "text-muted-foreground"}`}>
                  {lead.score}分
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SourceIcon source={lead.source} />
                  {lead.source === "email" ? "Email" : lead.source === "seo" ? "SEO" : "WhatsApp"}
                </span>
                <span>📍 {lead.location.split(",")[0]}</span>
                <span>🏭 {lead.industry}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Distribution */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">📊 来源分布</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
              <div className="w-[65%] bg-agent-email h-full" />
              <div className="w-[25%] bg-agent-seo h-full" />
              <div className="w-[10%] bg-agent-whatsapp h-full" />
            </div>
          </div>
          <div className="flex gap-3 mt-2 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-agent-email" />
              Email 65%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-agent-seo" />
              SEO 25%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-agent-whatsapp" />
              其他 10%
            </span>
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
