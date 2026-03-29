import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Target, 
  Settings, 
  Zap, 
  Users, 
  BarChart3, 
  Mail, 
  FileText,
  ChevronDown,
  ChevronRight,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  activeTask: string;
  onSelectTask: (task: string) => void;
}

const tasks = [
  { id: "onboarding", label: "企业知识录入", icon: "🏢", status: "active" },
  { id: "acquisition", label: "美国户外用品获客", icon: "🎯", status: "pending" },
];

const agents = [
  { id: "supervisor", name: "主管 Agent", emoji: "🤖", color: "text-agent-supervisor", status: "online" },
  { id: "seo", name: "SEO Agent", emoji: "🔍", color: "text-agent-seo", status: "online" },
  { id: "email", name: "Email Agent", emoji: "✉️", color: "text-agent-email", status: "online" },
  { id: "whatsapp", name: "WhatsApp Agent", emoji: "💬", color: "text-agent-whatsapp", locked: true },
];

const futureAgents = [
  { id: "logistics", name: "物流Agent", emoji: "🚢", desc: "报关/运输/跟踪" },
  { id: "competitor", name: "竞对监控Agent", emoji: "📈", desc: "价格/产品/策略监控" },
  { id: "pricing", name: "选品报价Agent", emoji: "💰", desc: "成本分析/智能定价" },
  { id: "customer", name: "客服Agent", emoji: "🎧", desc: "售后支持/投诉处理" },
];

const navItems = [
  { id: "leads", label: "线索收件箱", icon: Users, count: 23, alert: true },
  { id: "dashboard", label: "数据看板", icon: BarChart3 },
  { id: "emails", label: "邮件管理", icon: Mail, count: 450 },
  { id: "content", label: "内容中心", icon: FileText, count: 6 },
];

export function SidebarDrawer({
  open,
  onClose,
  activeTask,
  onSelectTask,
}: SidebarDrawerProps) {
  const [expandedSections, setExpandedSections] = useState({
    tasks: true,
    agents: true,
    future: false,
    nav: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTaskSelect = (taskId: string) => {
    onSelectTask(taskId);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <SheetTitle className="text-lg">DealClaw</SheetTitle>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              BETA
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务、Agent..."
                className="pl-9 h-10"
              />
            </div>

            {/* New Task Button */}
            <Button className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              新建获客任务
            </Button>

            {/* Navigation Items */}
            <Section
              title="快捷导航"
              icon={Target}
              expanded={expandedSections.nav}
              onToggle={() => toggleSection("nav")}
            >
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left hover:bg-muted group"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1">{item.label}</span>
                    {item.count !== undefined && (
                      <Badge
                        variant={item.alert ? "default" : "secondary"}
                        className="text-[10px] h-5"
                      >
                        {item.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* Tasks */}
            <Section
              title="任务列表"
              icon={MessageSquare}
              expanded={expandedSections.tasks}
              onToggle={() => toggleSection("tasks")}
            >
              <div className="space-y-1">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                      activeTask === task.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="text-lg">{task.icon}</span>
                    <span className="flex-1">{task.label}</span>
                    {task.status === "active" && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* Agent Team */}
            <Section
              title="数字员工团队"
              icon={Users}
              expanded={expandedSections.agents}
              onToggle={() => toggleSection("agents")}
            >
              <div className="space-y-1">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                      agent.locked ? "text-muted-foreground/50" : ""
                    )}
                  >
                    <span className="text-lg">{agent.emoji}</span>
                    <span className="flex-1">{agent.name}</span>
                    {!agent.locked ? (
                      <span className="w-2 h-2 rounded-full bg-agent-seo" />
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        P1
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Future Agents */}
              <button
                onClick={() => toggleSection("future")}
                className="mt-3 w-full p-3 rounded-lg border border-dashed border-border text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">即将加入...</p>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-muted-foreground transition-transform",
                      !expandedSections.future && "-rotate-90"
                    )}
                  />
                </div>
                {expandedSections.future && (
                  <div className="space-y-2 mt-2">
                    {futureAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span>{agent.emoji}</span>
                        <span>{agent.name}</span>
                        <span className="text-muted-foreground/50">
                          · {agent.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            </Section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Section Component
interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, expanded, onToggle, children }: SectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" />
          {title}
        </div>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform",
            !expanded && "-rotate-90"
          )}
        />
      </button>
      {expanded && <div className="mt-1">{children}</div>}
    </div>
  );
}
