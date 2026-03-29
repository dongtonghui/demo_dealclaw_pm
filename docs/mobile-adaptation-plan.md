# DealClaw Demo 移动端适配实现计划

## 📋 项目概述

将现有的桌面端三栏布局改造为移动端友好的响应式设计，支持从手机到平板的全尺寸适配。

**当前布局**: 左侧边栏 (256px) + 中间聊天区 (自适应) + 右侧边栏 (288px)  
**目标布局**: 移动端单栏视图 + 底部导航

---

## 🎯 核心目标

1. **响应式断点支持**: sm (640px), md (768px), lg (1024px), xl (1280px)
2. **移动端优先**: 触摸友好的交互，底部导航栏
3. **渐进增强**: 小屏幕折叠侧边栏，大屏幕展开全功能
4. **性能优化**: 移动端减少动画，按需加载组件

---

## 📐 架构改造方案

### 1. 布局架构 (Index.tsx)

```
桌面端 (lg+)                    移动端 (<lg)
┌─────────┬──────────┬────────┐     ┌─────────────────────┐
│ Sidebar │  Chat    │ Context│     │ Header (菜单按钮)    │
│  256px  │  自适应   │ 288px  │     ├─────────────────────┤
│         │          │        │     │                     │
│         │          │        │     │    Chat 内容区       │
│         │          │        │     │                     │
│         │          │        │     ├─────────────────────┤
│         │          │        │     │  💬 🤖 📊 ⚙️        │  ← 底部Tab
└─────────┴──────────┴────────┘     └─────────────────────┘
```

**改造点**:
- 添加响应式断点判断 Hook: `useBreakpoint()`
- 桌面端：维持现有三栏布局
- 平板端 (md-lg)：隐藏右侧面板，通过按钮展开
- 移动端 (<md)：底部 Tab 导航，侧边栏变为抽屉菜单

### 2. 组件改造清单

| 组件 | 桌面端 | 移动端改造 |
|------|--------|-----------|
| `Index.tsx` | 三栏 flex 布局 | 响应式布局 + 路由管理 |
| `LeftSidebar` | 固定左侧 w-64 | 抽屉菜单 (Sheet) |
| `ChatPanel` | 中间自适应 | 全屏，底部输入框固定 |
| `ContextPanel` | 固定右侧 w-72 | 独立页面 / 底部 Sheet |
| `MessageBubble` | 卡片式展示 | 全宽卡片，横向滑动操作 |
| 各类 Card | 多列展示 | 单列堆叠，可折叠 |

---

## 🗂️ 详细实施步骤

### Phase 1: 基础架构 (预计 2-3 小时)

#### 1.1 创建响应式工具 Hook

**文件**: `src/hooks/useBreakpoint.ts`

```typescript
// 断点定义
export const breakpoints = {
  sm: 640,   // 手机横屏
  md: 768,   // 平板竖屏  
  lg: 1024,  // 平板横屏/小笔记本
  xl: 1280,  // 桌面
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<keyof typeof breakpoints>('xl');
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < breakpoints.sm) setBreakpoint('sm');
      else if (w < breakpoints.md) setBreakpoint('md');
      else if (w < breakpoints.lg) setBreakpoint('lg');
      else setBreakpoint('xl');
      setIsMobile(w < breakpoints.md);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return { breakpoint, isMobile, isTablet: !isMobile && breakpoint === 'lg' };
}
```

#### 1.2 创建移动端导航状态管理

**文件**: `src/hooks/useMobileNavigation.ts`

```typescript
export type MobileTab = 'chat' | 'agents' | 'analytics' | 'settings';

export function useMobileNavigation() {
  const [activeTab, setActiveTab] = useState<MobileTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  
  return {
    activeTab, setActiveTab,
    sidebarOpen, setSidebarOpen,
    contextOpen, setContextOpen
  };
}
```

#### 1.3 改造主布局 Index.tsx

**改造内容**:
```tsx
export default function Index() {
  const { isMobile } = useBreakpoint();
  const nav = useMobileNavigation();
  const chatState = useChatState();
  
  // 移动端渲染
  if (isMobile) {
    return (
      <MobileLayout 
        nav={nav} 
        chatState={chatState}
      />
    );
  }
  
  // 桌面端渲染（保持现有）
  return <DesktopLayout chatState={chatState} />;
}
```

---

### Phase 2: 移动端布局组件 (预计 3-4 小时)

#### 2.1 移动端主布局组件

**文件**: `src/components/mobile/MobileLayout.tsx`

```tsx
export function MobileLayout({ nav, chatState }: Props) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 顶部栏 */}
      <MobileHeader 
        onMenuClick={() => nav.setSidebarOpen(true)}
        onContextClick={() => nav.setContextOpen(true)}
      />
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        {nav.activeTab === 'chat' && (
          <MobileChatPanel 
            messages={chatState.messages}
            onSendMessage={chatState.sendMessage}
          />
        )}
        {nav.activeTab === 'agents' && <MobileAgentsPage />}
        {nav.activeTab === 'analytics' && <MobileAnalyticsPage />}
        {nav.activeTab === 'settings' && <MobileSettingsPage />}
      </main>
      
      {/* 底部导航 */}
      <MobileBottomNav 
        activeTab={nav.activeTab}
        onTabChange={nav.setActiveTab}
      />
      
      {/* 抽屉菜单 */}
      <SidebarDrawer 
        open={nav.sidebarOpen}
        onClose={() => nav.setSidebarOpen(false)}
      />
      
      {/* 状态面板抽屉 */}
      <ContextDrawer
        open={nav.contextOpen}
        onClose={() => nav.setContextOpen(false)}
        agentStatuses={chatState.agentStatuses}
      />
    </div>
  );
}
```

#### 2.2 底部导航组件

**文件**: `src/components/mobile/MobileBottomNav.tsx`

```tsx
const tabs = [
  { id: 'chat', label: '聊天', icon: MessageCircle },
  { id: 'agents', label: 'Agent', icon: Bot },
  { id: 'analytics', label: '数据', icon: BarChart3 },
  { id: 'settings', label: '设置', icon: Settings },
];

export function MobileBottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="h-16 bg-card border-t border-border safe-area-pb">
      <div className="grid grid-cols-4 h-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
```

#### 2.3 移动端侧边栏抽屉

**文件**: `src/components/mobile/SidebarDrawer.tsx`

使用 shadcn/ui 的 Sheet 组件:
```tsx
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function SidebarDrawer({ open, onClose }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0">
        {/* 复用 LeftSidebar 内容，适配移动端 */}
        <MobileSidebarContent />
      </SheetContent>
    </Sheet>
  );
}
```

---

### Phase 3: 聊天界面适配 (预计 3-4 小时)

#### 3.1 移动端聊天面板

**文件**: `src/components/mobile/MobileChatPanel.tsx`

```tsx
export function MobileChatPanel({ messages, onSendMessage }) {
  return (
    <div className="h-full flex flex-col">
      {/* 消息列表 - 占据剩余空间 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <MessageList messages={messages} />
      </div>
      
      {/* 固定在底部的输入框 */}
      <div className="border-t border-border bg-card safe-area-pb">
        <MobileChatInput onSend={onSendMessage} />
      </div>
    </div>
  );
}
```

#### 3.2 移动端输入框

**文件**: `src/components/mobile/MobileChatInput.tsx`

```tsx
export function MobileChatInput({ onSend }) {
  return (
    <div className="p-3">
      <div className="flex items-end gap-2 bg-muted rounded-2xl px-3 py-2">
        {/* 附件按钮 */}
        <button className="p-2 text-muted-foreground">
          <Plus className="w-5 h-5" />
        </button>
        
        {/* 输入框 - 自动增高 */}
        <textarea
          rows={1}
          className="flex-1 bg-transparent resize-none max-h-32 py-2"
          placeholder="有什么可以帮你的..."
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        
        {/* 发送按钮 */}
        <button className="p-2 bg-primary text-primary-foreground rounded-full">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

#### 3.3 消息气泡适配

**文件**: 改造 `MessageBubble.tsx`

```tsx
export function MessageBubble({ message }) {
  const { isMobile } = useBreakpoint();
  
  return (
    <div className={cn(
      "flex gap-3",
      message.role === 'user' && "flex-row-reverse"
    )}>
      {/* 头像 */}
      <Avatar className={cn(
        "shrink-0",
        isMobile ? "w-8 h-8" : "w-10 h-10"
      )} />
      
      {/* 内容 - 移动端全宽 */}
      <div className={cn(
        "flex-1",
        isMobile ? "max-w-[85%]" : "max-w-[70%]"
      )}>
        <Card className="p-3">
          {message.content}
        </Card>
      </div>
    </div>
  );
}
```

---

### Phase 4: 卡片组件适配 (预计 4-5 小时)

#### 4.1 卡片响应式改造策略

所有卡片添加 `isMobile` 模式支持：

```tsx
interface CardProps {
  data: any;
  isMobile?: boolean;
  onAction?: (action: string) => void;
}

// 示例：CompanyProfileCard
export function CompanyProfileCard({ data, isMobile }) {
  if (isMobile) {
    return <MobileCompanyProfileCard data={data} />;
  }
  return <DesktopCompanyProfileCard data={data} />;
}
```

#### 4.2 移动端卡片设计原则

```
桌面端卡片 (多列布局)           移动端卡片 (单列堆叠)
┌─────────────────────────┐    ┌─────────────────┐
│ 标题                    │    │ 标题            │
├──────────┬──────────────┤    ├─────────────────┤
│ 信息 A   │  信息 B      │    │ 信息 A          │
│ 信息 C   │  信息 D      │    │ 信息 B          │
├──────────┴──────────────┤    │ 信息 C          │
│ 操作按钮组              │    │ 信息 D          │
└─────────────────────────┘    ├─────────────────┤
                               │ 操作按钮        │
                               └─────────────────┘
```

#### 4.3 可折叠卡片组件

**文件**: `src/components/mobile/CollapsibleCard.tsx`

```tsx
export function CollapsibleCard({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <Card className="overflow-hidden">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown className={cn(
          "w-5 h-5 transition-transform",
          open && "rotate-180"
        )} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
```

---

### Phase 5: 触摸交互优化 (预计 2-3 小时)

#### 5.1 添加触摸手势支持

**文件**: `src/hooks/useTouchGesture.ts`

```typescript
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}: SwipeConfig) {
  const touchStart = useRef({ x: 0, y: 0 });
  
  const onTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  
  const onTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    
    // 水平滑动
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      if (dx > 0) onSwipeRight?.();
      else onSwipeLeft?.();
    }
  };
  
  return { onTouchStart, onTouchEnd };
}
```

#### 5.2 消息列表滑动操作

```tsx
export function SwipeableMessage({ message, onDelete, onReply }) {
  const { onTouchStart, onTouchEnd } = useSwipeGesture({
    onSwipeLeft: onDelete,
    onSwipeRight: onReply
  });
  
  return (
    <div 
      className="relative touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 滑动时显示的操作背景 */}
      <div className="absolute inset-0 flex justify-between items-center px-4">
        <ReplyIcon />
        <DeleteIcon />
      </div>
      <MessageBubble message={message} />
    </div>
  );
}
```

#### 5.3 快速操作按钮 (FAB)

**文件**: `src/components/mobile/FloatingActionButton.tsx`

```tsx
export function FAB({ onClick, icon: Icon }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed right-4 bottom-20 w-14 h-14 
                 bg-primary text-primary-foreground 
                 rounded-full shadow-lg flex items-center justify-center
                 safe-area-mb"
    >
      <Icon className="w-6 h-6" />
    </motion.button>
  );
}
```

---

### Phase 6: 安全区域适配 (预计 1 小时)

#### 6.1 添加 safe-area 支持

**文件**: `src/styles/safe-area.css`

```css
/* iPhone 刘海屏适配 */
.safe-area-pt {
  padding-top: env(safe-area-inset-top);
}

.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-px {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* 底部导航栏安全高度 */
.safe-area-mb {
  margin-bottom: max(16px, env(safe-area-inset-bottom));
}
```

#### 6.2 Viewport 配置

**文件**: `index.html`

```html
<meta name="viewport" 
      content="width=device-width, initial-scale=1.0, 
               maximum-scale=1.0, user-scalable=no,
               viewport-fit=cover">
```

---

### Phase 7: 性能优化 (预计 2 小时)

#### 7.1 移动端动画降级

**文件**: `src/hooks/useReducedMotion.ts`

```typescript
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    mq.addEventListener('change', (e) => setReducedMotion(e.matches));
  }, []);
  
  return reducedMotion;
}
```

#### 7.2 虚拟滚动 (长列表优化)

```tsx
import { Virtuoso } from 'react-virtuoso';

export function MessageList({ messages }) {
  const { isMobile } = useBreakpoint();
  
  if (!isMobile || messages.length < 50) {
    return <SimpleMessageList messages={messages} />;
  }
  
  // 移动端长列表使用虚拟滚动
  return (
    <Virtuoso
      data={messages}
      itemContent={(index, message) => (
        <MessageBubble message={message} />
      )}
      followOutput="auto"
    />
  );
}
```

#### 7.3 图片懒加载

```tsx
export function LazyImage({ src, alt }) {
  return (
    <img 
      loading="lazy"
      src={src} 
      alt={alt}
      className="bg-muted animate-pulse"
      onLoad={(e) => e.target.classList.remove('animate-pulse')}
    />
  );
}
```

---

## 📊 实施时间线

| 阶段 | 内容 | 预计时间 | 优先级 |
|------|------|----------|--------|
| Phase 1 | 基础架构 (Hooks + 布局) | 2-3h | 🔴 高 |
| Phase 2 | 移动端布局组件 | 3-4h | 🔴 高 |
| Phase 3 | 聊天界面适配 | 3-4h | 🔴 高 |
| Phase 4 | 卡片组件适配 | 4-5h | 🟡 中 |
| Phase 5 | 触摸交互优化 | 2-3h | 🟡 中 |
| Phase 6 | 安全区域适配 | 1h | 🟢 低 |
| Phase 7 | 性能优化 | 2h | 🟢 低 |
| **总计** | | **17-22h** | |

---

## 🎯 最小可行产品 (MVP) 方案

如果时间有限，优先实现以下核心功能：

1. **基础响应式布局** (Phase 1)
2. **移动端导航** (Phase 2 的部分)
3. **聊天界面适配** (Phase 3 的核心)

**MVP 预计耗时**: 6-8 小时

---

## 🔧 依赖清单

### 需要安装的依赖

```bash
# 虚拟滚动 (可选)
npm install react-virtuoso

# 手势库 (可选，如果需要复杂手势)
npm install @use-gesture/react

# 设备检测 (可选)
npm install react-device-detect
```

### shadcn/ui 组件

```bash
npx shadcn add sheet        # 抽屉菜单
npx shadcn add tabs         # 标签页 (底部导航)
npx shadcn add scroll-area  # 滚动区域
npx shadcn add collapsible  # 可折叠组件
```

---

## ✅ 测试清单

### 功能测试

- [ ] iPhone 14 Pro (390×844) - 刘海屏适配
- [ ] iPhone SE (375×667) - 小屏幕适配
- [ ] iPad Pro (1024×1366) - 平板适配
- [ ] Android 主流机型测试

### 交互测试

- [ ] 底部导航切换流畅
- [ ] 抽屉菜单打开/关闭动画
- [ ] 键盘弹出时输入框位置正确
- [ ] 横向/纵向旋转适配

### 性能测试

- [ ] 长聊天记录滚动流畅
- [ ] 动画不掉帧 (60fps)
- [ ] 内存占用合理

---

## 📚 参考资源

1. [Tailwind CSS 响应式设计](https://tailwindcss.com/docs/responsive-design)
2. [iOS Safe Area](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
3. [React 移动端最佳实践](https://reactjs.org/docs/thinking-in-react.html)
4. [Framer Motion 移动端优化](https://www.framer.com/motion/performance/)

---

*计划制定时间: 2026-03-29*  
*适用于: DealClaw Demo v0.2.0*
