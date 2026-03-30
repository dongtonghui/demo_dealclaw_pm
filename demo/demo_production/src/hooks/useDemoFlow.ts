import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, CompanyProfile, CustomerPersona } from "./useChatState";

export type DemoStep = 
  | "idle"
  | "onboarding_start"
  | "onboarding_user_input"
  | "onboarding_followup"
  | "onboarding_profile_confirmed"
  | "task_creation_start"
  | "task_user_input"
  | "task_followup"
  | "task_persona_confirmed"
  | "coordinating_agents"
  | "strategy_generated"
  | "strategy_confirmed"
  | "new_lead_notification"
  | "lead_detail_viewed";

interface DemoFlowState {
  isRunning: boolean;
  currentStep: DemoStep;
  canProceed: boolean;
}

export interface DemoFlowActions {
  startDemo: () => void;
  stopDemo: () => void;
  proceedToNextStep: () => void;
  handleAction: (actionId: string) => void;
}

// Demo flow configuration - defined outside component to be stable
const DEMO_FLOW_CONFIG: Record<DemoStep, {
  nextStep: DemoStep;
  getMessages: (data: DemoData) => ChatMessage[];
  delay: number;
  autoProceed: boolean;
  waitForAction?: string;
}> = {
  idle: {
    nextStep: "onboarding_start",
    getMessages: () => [],
    delay: 0,
    autoProceed: false,
  },
  
  onboarding_start: {
    nextStep: "onboarding_user_input",
    getMessages: () => [
      {
        id: "demo-1",
        role: "agent",
        agent: "supervisor",
        content: "你好！我是您的数字员工团队主管 🤖\n\n我将为您协调 SEO、Email 等专业 Agent 为您获客。首先让我了解您的企业，您是做哪个行业的？",
        timestamp: new Date(),
      },
    ],
    delay: 1000,
    autoProceed: true,
  },
  
  onboarding_user_input: {
    nextStep: "onboarding_followup",
    getMessages: () => [
      {
        id: "demo-user-1",
        role: "user",
        content: "我们是户外用品工厂，主要生产露营帐篷和睡袋，有美国专利，给REI、Patagonia这些大品牌做过代工",
        timestamp: new Date(),
      },
    ],
    delay: 1500,
    autoProceed: true,
  },
  
  onboarding_followup: {
    nextStep: "onboarding_profile_confirmed",
    getMessages: () => [
      {
        id: "demo-2",
        role: "agent",
        agent: "supervisor",
        content: "了解了！户外用品是个很好的出口领域，给知名品牌代工说明品质有保障。您主要出口哪些市场？目标客户类型是批发商还是品牌商？",
        timestamp: new Date(),
      },
      {
        id: "demo-user-2",
        role: "user",
        content: "主要出口美国和欧洲，目标客户是批发商和大型零售商",
        timestamp: new Date(),
      },
      {
        id: "demo-3",
        role: "agent",
        agent: "supervisor",
        content: "好的！基于我们的对话，以下是我对贵公司的理解：",
        timestamp: new Date(),
        card: {
          type: "company-profile",
          data: {
            category: "户外用品（露营帐篷/睡袋/登山装备）",
            advantage: "自有工厂、美国专利技术、为REI/Patagonia代工、OEM/ODM能力",
            market: "北美、欧洲",
            targetCustomer: "批发商、大型零售商",
            priceRange: "中高端",
          } as CompanyProfile,
          actions: [
            { label: "编辑修改", id: "edit-profile", variant: "secondary" },
            { label: "✓ 确认无误", id: "confirm-profile", variant: "primary" },
          ],
        },
      },
    ],
    delay: 2000,
    autoProceed: false,
    waitForAction: "confirm-profile",
  },
  
  onboarding_profile_confirmed: {
    nextStep: "task_creation_start",
    getMessages: () => [
      {
        id: "demo-4",
        role: "agent",
        agent: "supervisor",
        content: "已了解您的企业！现在您可以告诉我您的获客目标。\n\n例如：「帮我找美国户外用品批发商」",
        timestamp: new Date(),
      },
    ],
    delay: 1000,
    autoProceed: true,
  },
  
  task_creation_start: {
    nextStep: "task_user_input",
    getMessages: () => [
      {
        id: "demo-user-3",
        role: "user",
        content: "帮我找美国户外用品批发商，年采购额100万-500万美元的",
        timestamp: new Date(),
      },
    ],
    delay: 1500,
    autoProceed: true,
  },
  
  task_user_input: {
    nextStep: "task_persona_confirmed",
    getMessages: () => [
      {
        id: "demo-5",
        role: "agent",
        agent: "supervisor",
        content: "收到！我来为您创建获客任务。\n\n基于您的企业画像（户外用品出口商）：\n• 目标地区：美国\n• 行业：户外用品\n• 客户类型：批发商\n• 采购规模：100万-500万美元\n\n让我确认几个细节：\n1. 期望多长时间看到效果？\n2. 目标客户的规模大概是？",
        timestamp: new Date(),
      },
      {
        id: "demo-user-4",
        role: "user",
        content: "希望3个月内见效，目标客户50-200人规模",
        timestamp: new Date(),
      },
      {
        id: "demo-6",
        role: "agent",
        agent: "supervisor",
        content: "了解了！这是您的目标客户画像：",
        timestamp: new Date(),
        card: {
          type: "customer-persona",
          data: {
            region: "美国",
            industry: "户外用品批发",
            scale: "中型（50-200人）",
            purchaseVolume: "100万-500万美元/年",
            decisionMaker: "采购经理/采购总监",
            timeline: "3个月内",
          } as CustomerPersona,
          actions: [
            { label: "编辑", id: "edit-persona", variant: "secondary" },
            { label: "✓ 确认无误", id: "confirm-persona", variant: "primary" },
          ],
        },
      },
    ],
    delay: 2000,
    autoProceed: false,
    waitForAction: "confirm-persona",
  },
  
  task_persona_confirmed: {
    nextStep: "coordinating_agents",
    getMessages: () => [
      {
        id: "demo-system-1",
        role: "system",
        content: "正在协调 SEO Agent 和 Email Agent 制定方案...",
        timestamp: new Date(),
      },
    ],
    delay: 2000,
    autoProceed: true,
  },
  
  coordinating_agents: {
    nextStep: "strategy_generated",
    getMessages: () => [
      {
        id: "demo-thinking",
        role: "agent",
        agent: "supervisor",
        content: "💭 正在思考...\n\n• 分析您的产品优势：专利技术、大牌代工经验\n• 匹配目标市场：美国户外用品批发商需求\n• 评估最佳获客渠道组合...",
        timestamp: new Date(),
      },
    ],
    delay: 3000,
    autoProceed: true,
  },
  
  strategy_generated: {
    nextStep: "strategy_confirmed",
    getMessages: (data) => [
      {
        id: "demo-7",
        role: "agent",
        agent: "supervisor",
        content: "方案已生成！这是为您定制的获客方案：",
        timestamp: new Date(),
        card: {
          type: "acquisition-plan",
          data: {
            seo: {
              mode: "AI建站（推荐）",
              keywords: "wholesale camping tents, bulk outdoor gear",
              contentPlan: "每周2篇行业文章 + 产品页面优化",
              expectedLeads: "8-12条/月",
              siteConfig: {
                domain: "yourcompany-dealclaw.com",
                template: "outdoor-gear-pro",
                features: ["产品展示", "公司介绍", "联系表单", "SEO优化"],
              },
            },
            email: {
              channel: "平台代发（高送达率95%+）",
              targetCustomers: "856家精准匹配企业",
              sendPlan: "每日25封，持续5周",
              expectedLeads: "15-20条/月",
              personalization: "基于采购历史和公司动态个性化",
            },
            summary: {
              cycle: "4-6周见效",
              totalLeads: "23-32条/月",
              costPerLead: "¥85-110/条",
              highIntent: "预计40-50%",
            },
          },
          actions: [
            { label: "调整配置", id: "adjust-plan", variant: "secondary" },
            { label: "🚀 确认执行", id: "confirm-plan", variant: "primary" },
          ],
        },
      },
      {
        id: "demo-8",
        role: "agent",
        agent: "seo",
        content: "📱 AI自动建站方案详情：\n\n我已为您准备了一个专业的外贸独立站模板，包含：\n• 响应式设计，适配手机和PC\n• 产品展示页面（支持帐篷/睡袋分类）\n• 公司实力展示（专利证书、代工案例）\n• SEO优化结构，利于Google收录\n• 多语言支持（英文/西班牙文）\n\n您可以直接使用，也可以进行二次配置。",
        timestamp: new Date(),
        card: {
          type: "site-generator",
          data: {
            template: "outdoor-gear-pro",
            preview: "https://preview.dealclaw.com/outdoor-gear-pro",
            sections: [
              { name: "首页Banner", editable: true },
              { name: "产品展示", editable: true },
              { name: "公司介绍", editable: true },
              { name: "联系我们", editable: true },
              { name: "客户案例", editable: true },
            ],
            theme: {
              primary: "#2E7D32",
              secondary: "#558B2F",
              accent: "#F57C00",
            },
          },
          actions: [
            { label: "🎨 二次配置", id: "edit-site", variant: "secondary" },
            { label: "👁️ 预览站点", id: "preview-site", variant: "secondary" },
          ],
        },
      },
    ],
    delay: 1500,
    autoProceed: false,
    waitForAction: "confirm-plan",
  },
  
  strategy_confirmed: {
    nextStep: "new_lead_notification",
    getMessages: () => [
      {
        id: "demo-9",
        role: "agent",
        agent: "supervisor",
        content: "✅ 获客任务已启动！\n\n• SEO Agent：正在生成首篇 SEO 文章...\n• Email Agent：正在筛选目标客户...\n• AI建站：正在部署您的独立站...\n\n我会每天 18:00 向您汇报进展。",
        timestamp: new Date(),
      },
    ],
    delay: 3000, // 给用户3秒时间阅读消息
    autoProceed: true,
  },
  
  new_lead_notification: {
    nextStep: "lead_detail_viewed",
    getMessages: () => [
      {
        id: "demo-system-2",
        role: "system",
        content: "正在执行获客任务，模拟中...",
        timestamp: new Date(),
      },
    ],
    delay: 2000,
    autoProceed: true,
  },
  
  lead_detail_viewed: {
    nextStep: "idle",
    getMessages: () => [],
    delay: 0,
    autoProceed: false,
  },
};

interface DemoData {
  companyProfile?: CompanyProfile;
  customerPersona?: CustomerPersona;
}

// Debug logger
const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[DemoFlow]', ...args);
  }
};

export function useDemoFlow(
  onMessagesAdd: (messages: ChatMessage[]) => void,
  onAgentStatusChange: (agent: string, status: string, task?: string, progress?: number) => void,
  onLeadNotification?: () => void
): DemoFlowState & DemoFlowActions {
  // Use a single state object to avoid stale closures
  const [state, setState] = useState<{
    isRunning: boolean;
    currentStep: DemoStep;
    canProceed: boolean;
  }>({
    isRunning: false,
    currentStep: "idle",
    canProceed: false,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Execute a step - using functional updates to avoid stale closures
  const executeStep = useCallback((step: DemoStep) => {
    if (isProcessingRef.current) {
      log('Already processing, skipping');
      return;
    }
    
    isProcessingRef.current = true;
    log('Executing step:', step);
    
    // Update state immediately
    setState(prev => ({ ...prev, currentStep: step, canProceed: false }));
    
    const config = DEMO_FLOW_CONFIG[step];
    if (!config) {
      log('No config for step:', step);
      isProcessingRef.current = false;
      return;
    }
    
    // Get messages for this step
    const messages = config.getMessages({});
    log('Step messages count:', messages.length);
    
    if (messages.length > 0) {
      // Stagger message delivery
      messages.forEach((msg, index) => {
        timeoutRef.current = setTimeout(() => {
          log('Adding message:', msg.id, 'for step:', step);
          onMessagesAdd([msg]);
          
          // Update agent status for certain steps
          if (step === "coordinating_agents") {
            onAgentStatusChange("seo", "working", "制定内容策略", 30);
            onAgentStatusChange("email", "working", "筛选目标客户", 40);
          }
          
          if (step === "strategy_confirmed") {
            onAgentStatusChange("seo", "working", "生成SEO文章", 60);
            onAgentStatusChange("email", "working", "筛选目标客户", 50);
          }
          
          // If this is the last message and auto-proceed is false, allow proceeding
          if (index === messages.length - 1 && !config.autoProceed && step !== "new_lead_notification") {
            log('Setting canProceed to true for step:', step);
            setState(prev => ({ ...prev, canProceed: true }));
            isProcessingRef.current = false;
          }
        }, index * 800);
      });
    }
    
    // Handle auto-proceed
    if (config.autoProceed) {
      const totalDelay = config.delay + (messages.length * 800);
      log('Auto-proceeding in', totalDelay, 'ms');
      timeoutRef.current = setTimeout(() => {
        const nextStep = config.nextStep;
        log('Auto-proceeding from', step, 'to', nextStep);
        
        // Special handling for new_lead_notification step
        if (step === "new_lead_notification") {
          log('Triggering lead notification popup');
          onLeadNotification?.();
        }
        
        isProcessingRef.current = false;
        executeStep(nextStep);
      }, totalDelay);
    } else if (step === "new_lead_notification") {
      // Fallback: Special handling for lead notification (when autoProceed is false)
      timeoutRef.current = setTimeout(() => {
        log('Triggering lead notification (fallback)');
        onLeadNotification?.();
        setState(prev => ({ ...prev, currentStep: "lead_detail_viewed", canProceed: true }));
        isProcessingRef.current = false;
      }, config.delay);
    } else if (messages.length === 0) {
      // No messages to display, allow proceeding immediately
      log('No messages, setting canProceed to true');
      setState(prev => ({ ...prev, canProceed: true }));
      isProcessingRef.current = false;
    }
    // If there are messages, canProceed will be set after the last message
  }, [onMessagesAdd, onAgentStatusChange, onLeadNotification]);

  const startDemo = useCallback(() => {
    log('Starting demo');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isProcessingRef.current = false;
    
    setState({
      isRunning: true,
      currentStep: "onboarding_start",
      canProceed: false,
    });
    
    // Small delay before starting
    timeoutRef.current = setTimeout(() => {
      executeStep("onboarding_start");
    }, 500);
  }, [executeStep]);

  const stopDemo = useCallback(() => {
    log('Stopping demo');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isProcessingRef.current = false;
    setState({
      isRunning: false,
      currentStep: "idle",
      canProceed: false,
    });
  }, []);

  const proceedToNextStep = useCallback(() => {
    log('Proceeding to next step, current:', state.currentStep, 'canProceed:', state.canProceed);
    
    if (!state.canProceed) {
      log('Cannot proceed, canProceed is false');
      return;
    }
    
    const config = DEMO_FLOW_CONFIG[state.currentStep];
    if (config) {
      const nextStep = config.nextStep;
      log('Proceeding from', state.currentStep, 'to', nextStep);
      setState(prev => ({ ...prev, canProceed: false }));
      executeStep(nextStep);
    }
  }, [state.currentStep, state.canProceed, executeStep]);

  const handleAction = useCallback((actionId: string) => {
    log('Handling action:', actionId, 'current step:', state.currentStep);
    
    const config = DEMO_FLOW_CONFIG[state.currentStep];
    log('Current step config:', config);
    log('waitForAction:', config?.waitForAction);
    
    if (config?.waitForAction === actionId) {
      log('Action matches waitForAction, proceeding');
      proceedToNextStep();
    } else {
      log('Action does not match waitForAction');
    }
    
    // Handle specific actions
    if (actionId === "edit-site") {
      log("Opening site editor...");
    }
  }, [state.currentStep, proceedToNextStep]);

  return {
    isRunning: state.isRunning,
    currentStep: state.currentStep,
    canProceed: state.canProceed,
    startDemo,
    stopDemo,
    proceedToNextStep,
    handleAction,
  };
}
