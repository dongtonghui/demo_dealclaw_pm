import { useState, useCallback, useRef } from "react";

export type MessageRole = "user" | "agent" | "system";
export type AgentType = "supervisor" | "seo" | "email" | "whatsapp";
export type CardType = "company-profile" | "customer-persona" | "acquisition-plan" | "seo-strategy" | "lead-summary";

export interface RichCard {
  type: CardType;
  data: Record<string, any>;
  actions?: { label: string; id: string; variant?: "primary" | "secondary" }[];
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  agent?: AgentType;
  content: string;
  card?: RichCard;
  timestamp: Date;
}

export interface AgentStatus {
  agent: AgentType;
  name: string;
  status: "idle" | "working" | "done";
  task?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "agent",
    agent: "supervisor",
    content: "你好！我是您的数字员工团队主管 🤖\n\n我将为您协调 SEO、Email 等专业 Agent 为您获客。首先让我了解您的企业，您是做哪个行业的？",
    timestamp: new Date(),
  },
];

const DEMO_FLOW: { trigger: string; responses: ChatMessage[] }[] = [
  {
    trigger: "户外",
    responses: [
      {
        id: "3",
        role: "agent",
        agent: "supervisor",
        content: "了解了！户外用品是个很好的出口领域。您主要出口哪些市场？目标客户类型是批发商还是品牌商？",
        timestamp: new Date(),
      },
    ],
  },
  {
    trigger: "美国",
    responses: [
      {
        id: "5",
        role: "agent",
        agent: "supervisor",
        content: "好的！基于我们的对话，以下是我对贵公司的理解：",
        card: {
          type: "company-profile",
          data: {
            category: "户外用品（帐篷/睡袋/登山装备）",
            advantage: "自有工厂、OEM定制、通过ISO认证",
            market: "北美、欧洲",
            targetCustomer: "批发商、品牌商",
            priceRange: "中高端",
          },
          actions: [
            { label: "编辑修改", id: "edit-profile", variant: "secondary" },
            { label: "✓ 确认无误", id: "confirm-profile", variant: "primary" },
          ],
        },
        timestamp: new Date(),
      },
    ],
  },
  {
    trigger: "confirm-profile",
    responses: [
      {
        id: "6",
        role: "agent",
        agent: "supervisor",
        content: "已了解您的企业！现在您可以告诉我您的获客目标。\n\n例如：「帮我找美国户外用品批发商」",
        timestamp: new Date(),
      },
    ],
  },
  {
    trigger: "找",
    responses: [
      {
        id: "8",
        role: "agent",
        agent: "supervisor",
        content: "收到！让我确认几个细节：\n1. 目标客户年采购额大概？\n2. 期望多长时间看到效果？",
        timestamp: new Date(),
      },
    ],
  },
  {
    trigger: "万",
    responses: [
      {
        id: "10",
        role: "agent",
        agent: "supervisor",
        content: "了解了！这是您的目标客户画像：",
        card: {
          type: "customer-persona",
          data: {
            region: "美国",
            industry: "户外用品批发",
            scale: "中型（50-200人）",
            purchaseVolume: "100万-500万美元/年",
            decisionMaker: "采购经理/采购总监",
            timeline: "3个月内",
          },
          actions: [
            { label: "编辑", id: "edit-persona", variant: "secondary" },
            { label: "✓ 确认无误", id: "confirm-persona", variant: "primary" },
          ],
        },
        timestamp: new Date(),
      },
    ],
  },
  {
    trigger: "confirm-persona",
    responses: [
      {
        id: "11",
        role: "system",
        content: "正在协调 SEO Agent 和 Email Agent 制定方案...",
        timestamp: new Date(),
      },
      {
        id: "12",
        role: "agent",
        agent: "supervisor",
        content: "方案已生成！这是为您定制的获客方案：",
        card: {
          type: "acquisition-plan",
          data: {
            seo: {
              mode: "AI建站（推荐）",
              keywords: "wholesale camping gear",
              contentPlan: "每周2篇行业文章",
              expectedLeads: "8条/月",
            },
            email: {
              channel: "平台代发（高送达率）",
              targetCustomers: "800家精准企业",
              sendPlan: "每日30封，持续4周",
              expectedLeads: "15条/月",
            },
            summary: {
              cycle: "4-6周",
              totalLeads: "23-32条",
              costPerLead: "¥85-110/条",
              highIntent: "40-50%",
            },
          },
          actions: [
            { label: "调整配置", id: "adjust-plan", variant: "secondary" },
            { label: "🚀 确认执行", id: "confirm-plan", variant: "primary" },
          ],
        },
        timestamp: new Date(),
      },
    ],
  },
  {
    trigger: "confirm-plan",
    responses: [
      {
        id: "13",
        role: "agent",
        agent: "supervisor",
        content: "✅ 获客任务已启动！\n\n• SEO Agent：正在生成首篇 SEO 文章...\n• Email Agent：正在筛选目标客户...\n\n我会每天 18:00 向您汇报进展。",
        timestamp: new Date(),
      },
    ],
  },
];

export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTask, setActiveTask] = useState<string>("onboarding");
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { agent: "supervisor", name: "主管 Agent", status: "working", task: "Onboarding" },
    { agent: "seo", name: "SEO Agent", status: "idle" },
    { agent: "email", name: "Email Agent", status: "idle" },
    { agent: "whatsapp", name: "WhatsApp Agent", status: "idle" },
  ]);
  const flowIndex = useRef(0);

  const addMessages = useCallback((newMsgs: ChatMessage[]) => {
    let delay = 0;
    newMsgs.forEach((msg, i) => {
      delay += 800 + i * 600;
      setTimeout(() => {
        setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
        if (i === newMsgs.length - 1) setIsTyping(false);
      }, delay);
    });
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Find matching flow
      const currentFlow = DEMO_FLOW[flowIndex.current];
      if (currentFlow && text.includes(currentFlow.trigger)) {
        flowIndex.current++;
        addMessages(currentFlow.responses);

        // Update agent statuses based on flow
        if (flowIndex.current >= 5) {
          setAgentStatuses((prev) =>
            prev.map((a) =>
              a.agent === "seo" ? { ...a, status: "working", task: "制定内容策略" } :
              a.agent === "email" ? { ...a, status: "working", task: "筛选目标客户" } : a
            )
          );
          setActiveTask("acquisition");
        }
      } else {
        // Default response
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: "收到您的消息。请继续告诉我更多信息，以便我更好地为您服务。",
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 1000);
      }
    },
    [addMessages]
  );

  const handleCardAction = useCallback(
    (actionId: string) => {
      const currentFlow = DEMO_FLOW[flowIndex.current];
      if (currentFlow && actionId === currentFlow.trigger) {
        flowIndex.current++;
        setIsTyping(true);
        addMessages(currentFlow.responses);
      }
    },
    [addMessages]
  );

  return {
    messages,
    isTyping,
    sendMessage,
    handleCardAction,
    activeTask,
    setActiveTask,
    agentStatuses,
  };
}
