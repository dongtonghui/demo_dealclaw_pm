import { PanelRightClose, PanelRightOpen, Activity, TrendingUp, Users, Mail, Search } from "lucide-react";
import type { AgentStatus, Lead } from "@/hooks/useChatState";

interface ContextPanelProps {
  open: boolean;
  onToggle: () => void;
  activeTask: string;
  agentStatuses: AgentStatus[];
  leads?: Lead[];
}

const STATUS_MAP = {
  idle: { label: "空闲", color: "bg-muted-foreground/30" },
  working: { label: "工作中", color: "bg-primary" },
  done: { label: "已完成", color: "bg-agent-seo" },
  error: { label: "异常", color: "bg-red-500" },
};

const AGENT_ICONS: Record<string, string> = {
  supervisor: "🤖",
  seo: "🔍",
  email: "✉️",
  whatsapp: "💬",
  lead: "🎯",
};

export function ContextPanel({ open, onToggle, activeTask, agentStatuses, leads = [] }: ContextPanelProps) {
  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="absolute right-4 top-4 z-10 w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <PanelRightOpen className="w-4 h-4" />
      </button>
    );
  }

  const highIntentLeads = leads.filter(l => l.score >= 80);
  const newLeads = leads.filter(l => l.status === "new");

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-sidebar flex flex-col h-full">
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          实时状态
        </span>
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Task Status */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            当前任务
          </h3>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground font-medium">
                {activeTask === "onboarding" ? "企业知识录入" : "美国户外用品获客"}
              </span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="text-xs text-muted-foreground">
              {activeTask === "onboarding" ? "完善企业信息以开始获客" : "获客任务执行中..."}
            </div>
            {activeTask !== "onboarding" && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: "35%" }} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 text-right">35% 完成</div>
              </div>
            )}
          </div>
        </section>

        {/* Agent Statuses */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Agent 工作状态
          </h3>
          <div className="space-y-2">
            {agentStatuses.map((agent) => {
              const s = STATUS_MAP[agent.status];
              return (
                <div key={agent.agent} className="bg-card rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{AGENT_ICONS[agent.agent]}</span>
                      <span className="text-sm text-foreground">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.color} ${agent.status === "working" ? "animate-pulse" : ""}`} />
                      <span className="text-[11px] text-muted-foreground">{s.label}</span>
                    </div>
                  </div>
                  {agent.task && (
                    <div className="mt-1">
                      <p className="text-[11px] text-muted-foreground font-mono">{agent.task}</p>
                      {agent.progress !== undefined && agent.progress > 0 && (
                        <div className="mt-1.5">
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all" 
                              style={{ width: `${agent.progress}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            快速数据
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <StatBox 
              label="总线索" 
              value={leads.length.toString()} 
              icon={<Users className="w-3 h-3" />}
              trend="+27%"
            />
            <StatBox 
              label="高意向" 
              value={highIntentLeads.length.toString()} 
              icon={<TrendingUp className="w-3 h-3" />}
              trend="+43%"
              highlight
            />
            <StatBox 
              label="SEO文章" 
              value="6" 
              icon={<Search className="w-3 h-3" />}
              trend="+2"
            />
            <StatBox 
              label="邮件发送" 
              value="450" 
              icon={<Mail className="w-3 h-3" />}
              trend="96%"
            />
          </div>
        </section>

        {/* Hot Leads */}
        {highIntentLeads.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              🔥 高意向线索
            </h3>
            <div className="space-y-2">
              {highIntentLeads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="bg-card rounded-lg p-3 cursor-pointer hover:bg-card/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-medium truncate">{lead.company}</span>
                    <span className="text-xs font-medium text-agent-seo">{lead.score}分</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span>📍 {lead.location.split(",")[0]}</span>
                    <span>{lead.source === "email" ? "📧" : lead.source === "seo" ? "🔍" : "💬"}</span>
                  </div>
                  {lead.lastContact && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      最新互动: {lead.lastContact}
                    </div>
                  )}
                </div>
              ))}
              {highIntentLeads.length > 3 && (
                <button className="w-full text-center text-xs text-primary hover:underline py-1">
                  查看全部 {highIntentLeads.length} 条
                </button>
              )}
            </div>
          </section>
        )}

        {/* New Leads Alert */}
        {newLeads.length > 0 && (
          <section>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-foreground font-medium">
                  {newLeads.length} 条新线索待跟进
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                建议优先处理评分 80+ 的高意向线索
              </p>
            </div>
          </section>
        )}

        {/* Knowledge Base */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            企业知识库
          </h3>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">知识完整度</span>
              <span className="text-foreground font-mono text-xs">{activeTask === "onboarding" ? "35%" : "78%"}</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: activeTask === "onboarding" ? "35%" : "78%" }} 
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {activeTask === "onboarding" 
                ? "继续对话以完善企业知识..." 
                : "企业知识库已完善，支持精准获客"}
            </p>
          </div>
        </section>

        {/* Weekly Goal */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            本周目标
          </h3>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">线索目标</span>
              <span className="text-foreground font-mono text-xs">23/30</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-agent-seo rounded-full transition-all" style={{ width: "77%" }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-muted-foreground">预计完成时间: 2天后</span>
              <span className="text-agent-seo">77%</span>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

function StatBox({ label, value, icon, trend, highlight }: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  trend: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? "bg-agent-seo/5 border border-agent-seo/20" : "bg-card"}`}>
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className={`text-lg font-semibold font-mono ${highlight ? "text-agent-seo" : "text-foreground"}`}>
        {value}
      </p>
      <p className={`text-[10px] ${trend.startsWith("+") || trend.endsWith("%") ? "text-agent-seo" : "text-muted-foreground"}`}>
        {trend}
      </p>
    </div>
  );
}
