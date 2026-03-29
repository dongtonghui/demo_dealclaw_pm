import { useState, useCallback } from "react";

export type MobileTab = "chat" | "agents" | "analytics" | "settings";

export interface MobileNavigationState {
  // Tab 状态
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
  
  // 侧边栏抽屉
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  
  // 上下文面板抽屉
  contextOpen: boolean;
  setContextOpen: (open: boolean) => void;
  openContext: () => void;
  closeContext: () => void;
  toggleContext: () => void;
  
  // 搜索面板
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export function useMobileNavigation(): MobileNavigationState {
  const [activeTab, setActiveTab] = useState<MobileTab>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const openContext = useCallback(() => setContextOpen(true), []);
  const closeContext = useCallback(() => setContextOpen(false), []);
  const toggleContext = useCallback(() => setContextOpen(prev => !prev), []);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    contextOpen,
    setContextOpen,
    openContext,
    closeContext,
    toggleContext,
    searchOpen,
    setSearchOpen,
    openSearch,
    closeSearch,
  };
}

// Tab 配置
export const mobileTabsConfig = [
  {
    id: "chat" as MobileTab,
    label: "聊天",
    shortLabel: "聊天",
    icon: "MessageCircle",
    activeIcon: "MessageCircle",
  },
  {
    id: "agents" as MobileTab,
    label: "Agent团队",
    shortLabel: "Agent",
    icon: "Bot",
    activeIcon: "Bot",
  },
  {
    id: "analytics" as MobileTab,
    label: "数据分析",
    shortLabel: "数据",
    icon: "BarChart3",
    activeIcon: "BarChart3",
  },
  {
    id: "settings" as MobileTab,
    label: "设置",
    shortLabel: "设置",
    icon: "Settings",
    activeIcon: "Settings",
  },
];
