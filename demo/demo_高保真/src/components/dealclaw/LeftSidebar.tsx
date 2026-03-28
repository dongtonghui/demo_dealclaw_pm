import { Search, Plus, MessageSquare, Target, Settings, ChevronDown, Zap } from "lucide-react";

interface LeftSidebarProps {
  activeTask: string;
  onSelectTask: (task: string) => void;
}

const tasks = [
  { id: "onboarding", label: "企业知识录入", icon: "🏢", status: "active" },
  { id: "acquisition", label: "美国户外用品获客", icon: "🎯", status: "pending" },
];

const agents = [
  { id: "supervisor", name: "主管 Agent", emoji: "🤖", color: "text-agent-supervisor" },
  { id: "seo", name: "SEO Agent", emoji: "🔍", color: "text-agent-seo" },
  { id: "email", name: "Email Agent", emoji: "✉️", color: "text-agent-email" },
  { id: "whatsapp", name: "WhatsApp Agent", emoji: "💬", color: "text-agent-whatsapp", locked: true },
];

export function LeftSidebar({ activeTask, onSelectTask }: LeftSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground tracking-tight">DealClaw</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">BETA</span>
      </div>

      {/* New Task */}
      <div className="p-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus className="w-4 h-4" />
          新建获客任务
        </button>
      </div>

      {/* Tasks */}
      <div className="px-3 mb-1">
        <div className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <MessageSquare className="w-3 h-3" />
          任务列表
        </div>
      </div>
      <div className="px-3 space-y-0.5">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              activeTask === task.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <span>{task.icon}</span>
            <span className="truncate">{task.label}</span>
          </button>
        ))}
      </div>

      {/* Agent Team */}
      <div className="mt-6 px-3 mb-1">
        <div className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Target className="w-3 h-3" />
          数字员工团队
        </div>
      </div>
      <div className="px-3 space-y-0.5 flex-1">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              agent.locked ? "text-muted-foreground/50" : "text-sidebar-foreground"
            }`}
          >
            <span>{agent.emoji}</span>
            <span className="truncate">{agent.name}</span>
            {agent.locked && (
              <span className="ml-auto text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                P1
              </span>
            )}
          </div>
        ))}

        {/* Future agents */}
        <div className="mt-3 mx-2 p-3 rounded-lg border border-dashed border-border">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            🚢 物流Agent · 📈 竞对监控 · 💰 选品报价
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">即将加入...</p>
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-4 h-4" />
          设置
        </button>
      </div>
    </aside>
  );
}
