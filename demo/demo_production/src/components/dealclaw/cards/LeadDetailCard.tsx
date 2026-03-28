import { useState } from "react";
import type { RichCard, Lead, Interaction } from "@/hooks/useChatState";
import { Mail, Phone, MapPin, Building2, Users, Clock, Star, TrendingUp, MessageSquare, Send, ArrowLeft } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

export function LeadDetailCard({ card, onAction }: Props) {
  const lead = card.data.lead as Lead;
  const [activeTab, setActiveTab] = useState<"profile" | "interactions" | "notes">("profile");

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50";
    if (score >= 60) return "text-yellow-500 bg-yellow-50";
    return "text-orange-500 bg-orange-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "🔥 高意向";
    if (score >= 60) return "⭐ 中意向";
    return "📌 低意向";
  };

  const getInteractionIcon = (type: Interaction["type"]) => {
    switch (type) {
      case "email_sent":
        return <Send className="w-4 h-4" />;
      case "email_opened":
        return <Mail className="w-4 h-4" />;
      case "email_replied":
        return <MessageSquare className="w-4 h-4" />;
      case "site_visit":
        return <TrendingUp className="w-4 h-4" />;
      case "whatsapp":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getInteractionColor = (type: Interaction["type"]) => {
    switch (type) {
      case "email_sent":
        return "text-blue-500 bg-blue-50";
      case "email_opened":
        return "text-green-500 bg-green-50";
      case "email_replied":
        return "text-purple-500 bg-purple-50";
      case "site_visit":
        return "text-orange-500 bg-orange-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAction("back-to-leads")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-foreground">线索详情</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
          {getScoreLabel(lead.score)} · {lead.score}分
        </div>
      </div>

      {/* Company Info */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl shrink-0">
            🏢
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{lead.company}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {lead.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <InfoItem icon={<Building2 className="w-3.5 h-3.5" />} label="行业" value={lead.industry} />
          <InfoItem icon={<Users className="w-3.5 h-3.5" />} label="规模" value={lead.size} />
          <InfoItem icon={<Clock className="w-3.5 h-3.5" />} label="最近联系" value={lead.lastContact || "未联系"} />
          <InfoItem icon={<Star className="w-3.5 h-3.5" />} label="来源" value={getSourceLabel(lead.source)} />
        </div>
      </div>

      {/* Contact Info */}
      {(lead.contactName || lead.email) && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">联系人</h4>
          <div className="space-y-2">
            {lead.contactName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">👤</span>
                <span className="text-foreground">{lead.contactName}</span>
                <span className="text-xs text-muted-foreground">({getRoleLabel(lead.decisionMaker)})</span>
              </div>
            )}
            {lead.email && (
              <a 
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  onAction("send-email", { email: lead.email });
                }}
              >
                <Mail className="w-3.5 h-3.5" />
                {lead.email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "profile", label: "画像" },
          { id: "interactions", label: "互动" },
          { id: "notes", label: "备注" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 py-3 min-h-[160px] max-h-[240px] overflow-y-auto">
        {activeTab === "profile" && (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">AI评分依据</h4>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>企业规模符合目标画像（{lead.size}）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>行业匹配度高（{lead.industry}）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>地理位置符合目标市场</span>
                </li>
                {lead.score >= 80 && (
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>有积极互动行为（打开邮件/访问网站）</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">建议跟进策略</h4>
              <p className="text-sm text-secondary-foreground bg-muted/50 rounded-lg p-2.5">
                {getFollowUpStrategy(lead)}
              </p>
            </div>
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="space-y-2">
            {lead.interactions && lead.interactions.length > 0 ? (
              lead.interactions.map((interaction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${getInteractionColor(interaction.type)}`}>
                    {getInteractionIcon(interaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{interaction.details}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{interaction.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无互动记录</p>
                <p className="text-xs mt-1">建议主动发起首次联系</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <textarea
              placeholder="添加跟进备注..."
              className="w-full h-20 px-3 py-2 text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:border-primary"
              defaultValue={card.data.notes || ""}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onAction("save-notes", { leadId: lead.id })}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:opacity-90 transition-opacity"
              >
                保存备注
              </button>
              <button
                onClick={() => onAction("add-tag", { leadId: lead.id })}
                className="px-3 py-1.5 bg-muted text-muted-foreground text-xs rounded-lg hover:text-foreground transition-colors"
              >
                + 添加标签
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <button
          onClick={() => onAction("generate-reply", { lead })}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <MessageSquare className="w-4 h-4" />
          生成回复
        </button>
        <button
          onClick={() => onAction("schedule-followup", { leadId: lead.id })}
          className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
        >
          提醒
        </button>
        <button
          onClick={() => onAction("assign-lead", { leadId: lead.id })}
          className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
        >
          分配
        </button>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function getSourceLabel(source: Lead["source"]): string {
  const labels: Record<string, string> = {
    email: "📧 邮件",
    seo: "🔍 SEO",
    whatsapp: "💬 WhatsApp",
  };
  return labels[source] || source;
}

function getRoleLabel(role?: string): string {
  if (!role) return "未知职位";
  return role;
}

function getFollowUpStrategy(lead: Lead): string {
  if (lead.score >= 80) {
    return "🔥 高意向线索！建议24小时内跟进，优先电话联系或发送详细产品资料。可尝试邀约视频会议。";
  } else if (lead.score >= 60) {
    return "⭐ 中意向线索。建议3天内通过邮件发送产品目录，持续培育，观察互动反馈后再决定下一步。";
  } else {
    return "📌 低意向线索。可加入邮件培育序列，定期发送行业资讯，长期培养意向。";
  }
}
