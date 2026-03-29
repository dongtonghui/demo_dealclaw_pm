import { MessageCircle, Bot, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MobileTab } from "@/hooks/useMobileNavigation";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  className?: string;
}

const tabs = [
  {
    id: "chat" as MobileTab,
    label: "聊天",
    icon: MessageCircle,
  },
  {
    id: "agents" as MobileTab,
    label: "Agent",
    icon: Bot,
  },
  {
    id: "analytics" as MobileTab,
    label: "数据",
    icon: BarChart3,
  },
  {
    id: "settings" as MobileTab,
    label: "设置",
    icon: Settings,
  },
];

export function MobileBottomNav({
  activeTab,
  onTabChange,
  className,
}: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-lg border-t border-border",
        "safe-area-pb",
        className
      )}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "relative tap-highlight-transparent",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// 简化版底部导航（仅聊天和菜单）
interface SimpleBottomNavProps {
  onMenuClick: () => void;
  onContextClick: () => void;
  className?: string;
}

export function SimpleBottomNav({
  onMenuClick,
  onContextClick,
  className,
}: SimpleBottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-lg border-t border-border",
        "safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <button
          onClick={onMenuClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm">☰</span>
          </div>
          <span className="text-sm font-medium">菜单</span>
        </button>

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-agent-seo animate-pulse" />
          <span className="text-xs text-muted-foreground">3 Agent 在线</span>
        </div>

        <button
          onClick={onContextClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-sm font-medium">状态</span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
        </button>
      </div>
    </nav>
  );
}
