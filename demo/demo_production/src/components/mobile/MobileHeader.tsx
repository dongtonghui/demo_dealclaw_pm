import { Menu, Zap, Bell, Search, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title = "DealClaw",
  subtitle,
  showBack,
  onBack,
  onMenuClick,
  onSearchClick,
  onNotificationClick,
  rightElement,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-lg border-b border-border",
        "safe-area-pt",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : onMenuClick ? (
            <button
              onClick={onMenuClick}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="font-semibold text-base truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {onNotificationClick && (
            <button
              onClick={onNotificationClick}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            </button>
          )}

          {rightElement}
        </div>
      </div>
    </header>
  );
}

// 紧凑版头部（用于子页面）
interface CompactHeaderProps {
  title: string;
  onBack: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function CompactHeader({ title, onBack, action }: CompactHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border safe-area-pt">
      <div className="flex items-center justify-between h-12 px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>

        <h1 className="font-medium text-base">{title}</h1>

        {action ? (
          <button
            onClick={action.onClick}
            className="text-sm text-primary font-medium"
          >
            {action.label}
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>
    </header>
  );
}
