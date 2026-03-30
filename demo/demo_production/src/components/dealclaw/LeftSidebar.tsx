import { Search, Plus, MessageSquare, Target, Settings, ChevronDown, Zap, Users, BarChart3, Mail, FileText, Play, Square } from "lucide-react";
import { useState } from "react";

interface LeftSidebarProps {
  activeTask: string;
  onSelectTask: (task: string) => void;
  onStartDemo?: () => void;
  onStopDemo?: () => void;
  isDemoRunning?: boolean;
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

export function LeftSidebar({ activeTask, onSelectTask, onStartDemo, onStopDemo, isDemoRunning }: LeftSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    tasks: true,
    agents: true,
    future: false,
    nav: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

      {/* Demo Button */}
      <div className="p-3">
        {isDemoRunning ? (
          <button 
            onClick={onStopDemo}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 text-sm hover:bg-amber-200 transition-colors"
          >
            <Square className="w-4 h-4 fill-current" />
            停止演示
          </button>
        ) : (
          <button 
            onClick={onStartDemo}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            功能演示
          </button>
        )}
      </div>

      {/* New Task */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus className="w-4 h-4" />
          新建获客任务
        </button>
      </div>

      {/* Navigation Items */}
      <div className="px-3 mb-1">
        <button 
          onClick={() => toggleSection("nav")}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            快捷导航
          </div>
          <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.nav ? "" : "-rotate-90"}`} />
        </button>
      </div>
      {expandedSections.nav && (
        <div className="px-3 space-y-0.5 mb-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left hover:bg-sidebar-accent group"
            >
              <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              <span className="truncate text-sidebar-foreground">{item.label}</span>
              {item.count !== undefined && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono ${item.alert ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tasks */}
      <div className="px-3 mb-1">
        <button 
          onClick={() => toggleSection("tasks")}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            任务列表
          </div>
          <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.tasks ? "" : "-rotate-90"}`} />
        </button>
      </div>
      {expandedSections.tasks && (
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
              {task.status === "active" && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Agent Team */}
      <div className="mt-4 px-3 mb-1">
        <button 
          onClick={() => toggleSection("agents")}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            数字员工团队
          </div>
          <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.agents ? "" : "-rotate-90"}`} />
        </button>
      </div>
      {expandedSections.agents && (
        <div className="px-3 space-y-0.5 flex-1 overflow-y-auto">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                agent.locked ? "text-muted-foreground/50" : "text-sidebar-foreground"
              }`}
            >
              <span>{agent.emoji}</span>
              <span className="truncate">{agent.name}</span>
              {!agent.locked && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-agent-seo" />
              )}
              {agent.locked && (
                <span className="ml-auto text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                  P1
                </span>
              )}
            </div>
          ))}

          {/* Future agents */}
          <button 
            onClick={() => toggleSection("future")}
            className="mt-3 mx-2 p-3 rounded-lg border border-dashed border-border w-full text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-muted-foreground">即将加入...</p>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSections.future ? "" : "-rotate-90"}`} />
            </div>
            {expandedSections.future && (
              <div className="space-y-1.5 mt-2">
                {futureAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                    <span>{agent.emoji}</span>
                    <span>{agent.name}</span>
                    <span className="text-muted-foreground/40">· {agent.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </button>
        </div>
      )}

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
