import { PanelRightClose, PanelRightOpen, Activity } from "lucide-react";
import type { AgentStatus } from "@/hooks/useChatState";

interface ContextPanelProps {
  open: boolean;
  onToggle: () => void;
  activeTask: string;
  agentStatuses: AgentStatus[];
}

const STATUS_MAP = {
  idle: { label: "空闲", color: "bg-muted-foreground/30" },
  working: { label: "工作中", color: "bg-primary" },
  done: { label: "已完成", color: "bg-agent-seo" },
};

export function ContextPanel({ open, onToggle, activeTask, agentStatuses }: ContextPanelProps) {
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
                    <span className="text-sm text-foreground">{agent.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.color} ${agent.status === "working" ? "animate-pulse-glow" : ""}`} />
                      <span className="text-[11px] text-muted-foreground">{s.label}</span>
                    </div>
                  </div>
                  {agent.task && (
                    <p className="text-[11px] text-muted-foreground font-mono">{agent.task}</p>
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
            <StatBox label="总线索" value="0" />
            <StatBox label="高意向" value="0" />
            <StatBox label="SEO文章" value="0" />
            <StatBox label="邮件发送" value="0" />
          </div>
        </section>

        {/* Knowledge Base */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            企业知识库
          </h3>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">知识完整度</span>
              <span className="text-foreground font-mono text-xs">35%</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: "35%" }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              继续对话以完善企业知识...
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg p-3 text-center">
      <p className="text-lg font-semibold text-foreground font-mono">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
