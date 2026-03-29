import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { SidebarDrawer } from "./SidebarDrawer";
import { ContextDrawer } from "./ContextDrawer";
import { MobileChatPanel } from "./MobileChatPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  TrendingUp,
  Mail,
  Search,
  ChevronRight,
  Bell,
  Shield,
  Moon,
  Globe,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useMobileNavigation, type MobileTab } from "@/hooks/useMobileNavigation";
import type { useChatState } from "@/hooks/useChatState";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  chatState: ReturnType<typeof useChatState>;
}

export function MobileLayout({ chatState }: MobileLayoutProps) {
  const nav = useMobileNavigation();
  const [settingsTab, setSettingsTab] = useState<"general" | "agents" | "account">("general");

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <MobileHeader
        title={getHeaderTitle(nav.activeTab)}
        subtitle={getHeaderSubtitle(nav.activeTab, chatState.activeTask)}
        onMenuClick={nav.openSidebar}
        onContextClick={nav.openContext}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pt-14">
        <AnimatePresence mode="wait">
          {nav.activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <MobileChatPanel
                messages={chatState.messages}
                onSendMessage={chatState.sendMessage}
                onCardAction={chatState.handleCardAction}
                onFileUpload={chatState.handleFileUpload}
                isTyping={chatState.isTyping}
              />
            </motion.div>
          )}

          {nav.activeTab === "agents" && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <MobileAgentsPage agentStatuses={chatState.agentStatuses} />
            </motion.div>
          )}

          {nav.activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <MobileAnalyticsPage leads={chatState.leads} />
            </motion.div>
          )}

          {nav.activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <MobileSettingsPage activeTab={settingsTab} onTabChange={setSettingsTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab={nav.activeTab} onTabChange={nav.setActiveTab} />

      {/* Drawers */}
      <SidebarDrawer
        open={nav.sidebarOpen}
        onClose={nav.closeSidebar}
        activeTask={chatState.activeTask}
        onSelectTask={(task) => {
          chatState.setActiveTask(task);
          nav.closeSidebar();
        }}
      />

      <ContextDrawer
        open={nav.contextOpen}
        onClose={nav.closeContext}
        activeTask={chatState.activeTask}
        agentStatuses={chatState.agentStatuses}
        leads={chatState.leads}
      />
    </div>
  );
}

// Helper functions
function getHeaderTitle(tab: MobileTab): string {
  switch (tab) {
    case "chat":
      return "DealClaw";
    case "agents":
      return "数字员工团队";
    case "analytics":
      return "数据分析";
    case "settings":
      return "设置";
    default:
      return "DealClaw";
  }
}

function getHeaderSubtitle(tab: MobileTab, activeTask: string): string | undefined {
  if (tab !== "chat") return undefined;
  return activeTask === "onboarding" ? "企业知识录入" : "美国户外用品获客";
}

// Mobile Agents Page
interface MobileAgentsPageProps {
  agentStatuses: ReturnType<typeof useChatState>["agentStatuses"];
}

function MobileAgentsPage({ agentStatuses }: MobileAgentsPageProps) {
  const agents = [
    {
      id: "supervisor",
      name: "主管 Agent",
      emoji: "🤖",
      description: "任务调度与协调",
      status: "online",
      tasks: 12,
      efficiency: 98,
    },
    {
      id: "seo",
      name: "SEO Agent",
      emoji: "🔍",
      description: "关键词研究与内容优化",
      status: "online",
      tasks: 8,
      efficiency: 95,
    },
    {
      id: "email",
      name: "Email Agent",
      emoji: "✉️",
      description: "邮件营销与自动化",
      status: "online",
      tasks: 156,
      efficiency: 99,
    },
    {
      id: "whatsapp",
      name: "WhatsApp Agent",
      emoji: "💬",
      description: "即时通讯与客户服务",
      status: "locked",
      tasks: 0,
      efficiency: 0,
    },
  ];

  const futureAgents = [
    { id: "logistics", name: "物流Agent", emoji: "🚢", desc: "报关/运输/跟踪" },
    { id: "competitor", name: "竞对监控Agent", emoji: "📈", desc: "价格/产品/策略监控" },
    { id: "pricing", name: "选品报价Agent", emoji: "💰", desc: "成本分析/智能定价" },
    { id: "customer", name: "客服Agent", emoji: "🎧", desc: "售后支持/投诉处理" },
  ];

  return (
    <ScrollArea className="h-full px-4 py-4 pb-24">
      <div className="space-y-4">
        {/* Active Agents */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            运行中
          </h2>
          <div className="space-y-3">
            {agents.slice(0, 3).map((agent) => (
              <Card key={agent.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    {agent.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{agent.name}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-agent-seo mr-1" />
                        在线
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-muted-foreground">
                        今日任务: <span className="text-foreground">{agent.tasks}</span>
                      </span>
                      <span className="text-muted-foreground">
                        效率: <span className="text-agent-seo">{agent.efficiency}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Locked Agents */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            待解锁
          </h2>
          <Card className="p-4 opacity-60">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                💬
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">WhatsApp Agent</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    P1 版本
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  即时通讯与客户服务
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Future Agents */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            即将推出
          </h2>
          <div className="space-y-2">
            {futureAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border"
              >
                <span className="text-xl">{agent.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

// Mobile Analytics Page
interface MobileAnalyticsPageProps {
  leads: ReturnType<typeof useChatState>["leads"];
}

function MobileAnalyticsPage({ leads }: MobileAnalyticsPageProps) {
  const highIntentLeads = leads.filter((l) => l.score >= 80);

  const stats = [
    { label: "总线索", value: leads.length, trend: "+27%", icon: Users },
    { label: "高意向", value: highIntentLeads.length, trend: "+43%", icon: TrendingUp },
    { label: "邮件送达", value: "96%", trend: "+2%", icon: Mail },
    { label: "SEO文章", value: 6, trend: "+2", icon: Search },
  ];

  return (
    <ScrollArea className="h-full px-4 py-4 pb-24">
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] text-agent-seo">{stat.trend}</span>
              </div>
              <p className="text-2xl font-semibold font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Weekly Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">本周目标</h3>
            <span className="text-sm font-mono">23/30</span>
          </div>
          <Progress value={77} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>预计 2 天后完成</span>
            <span className="text-agent-seo font-medium">77%</span>
          </div>
        </Card>

        {/* Knowledge Base */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">企业知识库</h3>
            <span className="text-sm font-mono">78%</span>
          </div>
          <Progress value={78} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            知识库已完善，支持精准获客
          </p>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-3 flex-col gap-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">详细报表</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1">
            <Mail className="w-5 h-5" />
            <span className="text-xs">邮件分析</span>
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

// Mobile Settings Page
interface MobileSettingsPageProps {
  activeTab: "general" | "agents" | "account";
  onTabChange: (tab: "general" | "agents" | "account") => void;
}

function MobileSettingsPage({ activeTab, onTabChange }: MobileSettingsPageProps) {
  const settings = [
    { icon: Bell, label: "通知设置", description: "管理推送通知" },
    { icon: Moon, label: "深色模式", description: "跟随系统" },
    { icon: Globe, label: "语言", description: "简体中文" },
    { icon: Shield, label: "隐私与安全", description: "" },
    { icon: HelpCircle, label: "帮助与反馈", description: "" },
  ];

  return (
    <ScrollArea className="h-full px-4 py-4 pb-24">
      <div className="space-y-4">
        {/* Profile Card */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
              🏢
            </div>
            <div className="flex-1">
              <h3 className="font-medium">户外用品有限公司</h3>
              <p className="text-xs text-muted-foreground">admin@outdoor.com</p>
            </div>
            <Button variant="ghost" size="sm">
              编辑
            </Button>
          </div>
        </Card>

        {/* Settings List */}
        <Card>
          {settings.map((setting, index) => (
            <button
              key={setting.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left",
                index !== settings.length - 1 && "border-b border-border"
              )}
            >
              <setting.icon className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{setting.label}</p>
                {setting.description && (
                  <p className="text-xs text-muted-foreground">
                    {setting.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </Card>

        {/* About */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">DealClaw v0.2.0</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">
            © 2026 DealClaw. All rights reserved.
          </p>
        </div>

        {/* Logout */}
        <Button variant="outline" className="w-full text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </ScrollArea>
  );
}
