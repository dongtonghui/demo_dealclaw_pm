import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Mail, 
  Search,
  Target,
  Sparkles,
  Clock
} from "lucide-react";
import type { AgentStatus, Lead } from "@/hooks/useChatState";
import { cn } from "@/lib/utils";

interface ContextDrawerProps {
  open: boolean;
  onClose: () => void;
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

export function ContextDrawer({
  open,
  onClose,
  activeTask,
  agentStatuses,
  leads = [],
}: ContextDrawerProps) {
  const highIntentLeads = leads.filter((l) => l.score >= 80);
  const newLeads = leads.filter((l) => l.status === "new");

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[320px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <SheetTitle className="text-base">实时状态</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Task Status Card */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">当前任务</span>
                </div>
                <Badge variant="default" className="text-[10px]">
                  执行中
                </Badge>
              </div>
              <p className="text-sm font-medium mb-2">
                {activeTask === "onboarding"
                  ? "企业知识录入"
                  : "美国户外用品获客"}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {activeTask === "onboarding"
                  ? "完善企业信息以开始获客"
                  : "获客任务执行中..."}
              </p>
              {activeTask !== "onboarding" && (
                <>
                  <Progress value={35} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-2 text-right">
                    35% 完成
                  </p>
                </>
              )}
            </Card>

            {/* Agent Statuses */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Agent 工作状态
              </h3>
              <div className="space-y-2">
                {agentStatuses.map((agent) => {
                  const s = STATUS_MAP[agent.status];
                  return (
                    <Card key={agent.agent} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{AGENT_ICONS[agent.agent]}</span>
                          <span className="text-sm font-medium">{agent.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              s.color,
                              agent.status === "working" && "animate-pulse"
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {s.label}
                          </span>
                        </div>
                      </div>
                      {agent.task && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-muted-foreground font-mono line-clamp-1">
                            {agent.task}
                          </p>
                          {agent.progress !== undefined && agent.progress > 0 && (
                            <Progress value={agent.progress} className="h-1" />
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                快速数据
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <StatCard
                  label="总线索"
                  value={leads.length.toString()}
                  icon={<Users className="w-3 h-3" />}
                  trend={"+27%"}
                />
                <StatCard
                  label="高意向"
                  value={highIntentLeads.length.toString()}
                  icon={<TrendingUp className="w-3 h-3" />}
                  trend={"+43%"}
                  highlight
                />
                <StatCard
                  label="SEO文章"
                  value="6"
                  icon={<Search className="w-3 h-3" />}
                  trend={"+2"}
                />
                <StatCard
                  label="邮件发送"
                  value="450"
                  icon={<Mail className="w-3 h-3" />}
                  trend="96%"
                />
              </div>
            </div>

            {/* Hot Leads */}
            {highIntentLeads.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-red-500">🔥</span>
                  高意向线索
                </h3>
                <div className="space-y-2">
                  {highIntentLeads.slice(0, 3).map((lead) => (
                    <Card
                      key={lead.id}
                      className="p-3 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {lead.company}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-agent-seo border-agent-seo/30"
                        >
                          {lead.score}分
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span>📍 {lead.location.split(",")[0]}</span>
                        <span>
                          {lead.source === "email"
                            ? "📧"
                            : lead.source === "seo"
                            ? "🔍"
                            : "💬"}
                        </span>
                      </div>
                      {lead.lastContact && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {lead.lastContact}
                        </div>
                      )}
                    </Card>
                  ))}
                  {highIntentLeads.length > 3 && (
                    <button className="w-full text-center text-xs text-primary py-2">
                      查看全部 {highIntentLeads.length} 条
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* New Leads Alert */}
            {newLeads.length > 0 && (
              <Card className="p-3 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium">
                    {newLeads.length} 条新线索待跟进
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  建议优先处理评分 80+ 的高意向线索
                </p>
              </Card>
            )}

            {/* Knowledge Base */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                企业知识库
              </h3>
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">知识完整度</span>
                  <span className="text-sm font-mono">
                    {activeTask === "onboarding" ? "35%" : "78%"}
                  </span>
                </div>
                <Progress
                  value={activeTask === "onboarding" ? 35 : 78}
                  className="h-1.5"
                />
                <p className="text-[11px] text-muted-foreground mt-2">
                  {activeTask === "onboarding"
                    ? "继续对话以完善企业知识..."
                    : "企业知识库已完善，支持精准获客"}
                </p>
              </Card>
            </div>

            {/* Weekly Goal */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                本周目标
              </h3>
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">线索目标</span>
                  <span className="text-sm font-mono">23/30</span>
                </div>
                <Progress value={77} className="h-1.5" />
                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className="text-muted-foreground">预计 2 天后完成</span>
                  <span className="text-agent-seo font-medium">77%</span>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  trend,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-3 text-center",
        highlight && "border-agent-seo/30 bg-agent-seo/5"
      )}
    >
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p
        className={cn(
          "text-xl font-semibold font-mono",
          highlight ? "text-agent-seo" : "text-foreground"
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "text-[10px]",
          trend.startsWith("+") ? "text-agent-seo" : "text-muted-foreground"
        )}
      >
        {trend}
      </p>
    </Card>
  );
}
