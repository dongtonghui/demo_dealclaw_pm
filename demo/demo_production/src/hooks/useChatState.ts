import { useState, useCallback, useRef } from "react";

export type MessageRole = "user" | "agent" | "system";
export type AgentType = "supervisor" | "seo" | "email" | "whatsapp" | "lead";
export type CardType = 
  | "company-profile" 
  | "customer-persona" 
  | "acquisition-plan" 
  | "seo-strategy"
  | "seo-article"
  | "email-preview"
  | "customer-list"
  | "lead-summary"
  | "data-dashboard"
  | "task-progress"
  | "file-upload"
  | "whatsapp-config";

export interface RichCard {
  type: CardType;
  data: Record<string, any>;
  actions?: { label: string; id: string; variant?: "primary" | "secondary" | "danger" }[];
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
  status: "idle" | "working" | "done" | "error";
  task?: string;
  progress?: number;
}

export interface Lead {
  id: string;
  company: string;
  location: string;
  industry: string;
  size: string;
  score: number;
  source: "email" | "seo" | "whatsapp";
  status: "new" | "contacted" | "following" | "converted";
  lastContact?: string;
  contactName?: string;
  email?: string;
  interactions?: Interaction[];
}

export interface Interaction {
  type: "email_sent" | "email_opened" | "email_replied" | "site_visit" | "whatsapp";
  timestamp: string;
  details?: string;
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

// Mock data for SEO
const MOCK_KEYWORDS = [
  { keyword: "wholesale camping tents", volume: 1300, difficulty: "medium", priority: "high" },
  { keyword: "bulk outdoor sleeping bags", volume: 890, difficulty: "low", priority: "high" },
  { keyword: "camping gear distributor", volume: 720, difficulty: "medium", priority: "medium" },
  { keyword: "outdoor equipment wholesale", volume: 2100, difficulty: "high", priority: "medium" },
];

const MOCK_ARTICLE = {
  title: "2024年露营装备市场趋势：批发商如何把握机遇",
  content: `The camping gear market is experiencing unprecedented growth in 2024. With the global outdoor recreation industry projected to reach $1.2 trillion by 2025, wholesalers have significant opportunities to capitalize on this trend.

Key Market Trends:

1. Sustainable Materials Demand
Consumers are increasingly seeking eco-friendly camping gear. Wholesalers who source products made from recycled materials, organic cotton, and sustainable manufacturing processes are seeing 35% higher demand compared to traditional products.

2. Lightweight Innovation
The trend toward ultralight camping equipment continues to accelerate. Backpackers and hikers are willing to pay premium prices for gear that reduces pack weight without compromising durability.

3. Smart Camping Technology
Integration of technology into camping gear - from solar-powered tents to GPS-enabled sleeping bags - represents the fastest-growing segment with 45% year-over-year growth.

4. Family Camping Resurgence
Post-pandemic, family camping trips have increased by 28%, driving demand for larger tents, family-sized sleeping bags, and camping furniture.

Opportunities for Wholesalers:

• Partner with innovative manufacturers who prioritize sustainability
• Stock a diverse range of price points to capture different market segments  
• Invest in product knowledge training for your sales team
• Develop relationships with emerging outdoor brands before they become mainstream

The wholesalers who adapt quickly to these trends and build strong supplier relationships will be best positioned to capture market share in this growing industry.`,
  originality: 96,
  readability: "good",
  aiScore: "low",
};

// Mock data for Email
const MOCK_CUSTOMERS = [
  { id: "1", company: "Outdoor Gear Co.", location: "California, USA", size: "120人", score: 92, industry: "户外零售" },
  { id: "2", company: "Summit Camping Supply", location: "Texas, USA", size: "85人", score: 88, industry: "装备批发" },
  { id: "3", company: "Wild Trail Supply", location: "Florida, USA", size: "200人", score: 85, industry: "户外用品" },
  { id: "4", company: "Adventure Depot", location: "New York, USA", size: "150人", score: 83, industry: "户外品牌" },
  { id: "5", company: "Mountain Gear Wholesale", location: "Colorado, USA", size: "95人", score: 81, industry: "装备分销" },
];

const MOCK_EMAIL_TEMPLATE = {
  subject: "Quality Camping Gear Supply - OEM Available",
  body: `Hi [Name],

I noticed [Company] has been expanding your camping product line. Congratulations on the new store opening in [Location]!

We're a specialized camping gear manufacturer with 15 years of experience serving wholesalers across North America and Europe. Our product range includes:

• Premium camping tents (2-8 person capacity)
• Ultralight sleeping bags (-10°C to 15°C ratings)  
• Camping furniture and accessories
• Custom OEM/ODM services

Why partners choose us:
✓ Factory-direct pricing (20% below market average)
✓ ISO 9001 & BSCI certified manufacturing
✓ Flexible MOQ starting from 100 units
✓ 30-day production turnaround
✓ Full quality inspection & warranty

I'd love to share our wholesale catalog and discuss how we can support [Company]'s growth. Would you be available for a brief call this week?

Best regards,
Sarah Chen
Export Manager

P.S. We're currently offering 5% off first orders for new wholesale partners.`,
};

// Mock data for Leads
const MOCK_LEADS: Lead[] = [
  {
    id: "L001",
    company: "Summit Camping Supply",
    location: "Austin, Texas, USA",
    industry: "户外用品零售",
    size: "85人",
    score: 92,
    source: "email",
    status: "new",
    contactName: "Mike Johnson",
    email: "mike@summitcamping.com",
    lastContact: "2小时前",
    interactions: [
      { type: "email_sent", timestamp: "2026-03-28 09:30", details: "开发信已送达" },
      { type: "email_opened", timestamp: "2026-03-28 14:20", details: "打开邮件" },
      { type: "site_visit", timestamp: "2026-03-28 16:45", details: "访问产品页面" },
      { type: "email_replied", timestamp: "2026-03-28 10:15", details: "回复询问价格表" },
    ],
  },
  {
    id: "L002", 
    company: "Mountain Gear Wholesale",
    location: "Denver, Colorado, USA",
    industry: "装备批发",
    size: "120人",
    score: 88,
    source: "seo",
    status: "contacted",
    contactName: "Sarah Lee",
    email: "sarah@mountaingear.com",
    lastContact: "5小时前",
    interactions: [
      { type: "site_visit", timestamp: "2026-03-28 08:15", details: "通过搜索进入网站" },
      { type: "site_visit", timestamp: "2026-03-28 08:30", details: "浏览产品目录" },
      { type: "email_sent", timestamp: "2026-03-28 11:00", details: "发送产品资料" },
    ],
  },
  {
    id: "L003",
    company: "Outdoor Adventure Co.",
    location: "Seattle, Washington, USA", 
    industry: "户外品牌",
    size: "200人",
    score: 76,
    source: "email",
    status: "following",
    contactName: "David Chen",
    email: "david@outdooradventure.com",
    lastContact: "1天前",
    interactions: [
      { type: "email_sent", timestamp: "2026-03-27 10:00", details: "首封开发信" },
      { type: "email_opened", timestamp: "2026-03-27 15:30", details: "打开邮件" },
    ],
  },
];

// Mock data for Dashboard
const MOCK_DASHBOARD = {
  period: "本周 (3/20 - 3/27)",
  leads: { current: 28, last: 22, change: "+27%" },
  highIntent: { current: 10, last: 7, change: "+43%" },
  costPerLead: { current: "¥98", last: "¥105", change: "-7%" },
  replyRate: { current: "4.5%", last: "3.8%", change: "+18%" },
  traffic: { current: 520, last: 410, change: "+27%" },
  sourceDistribution: {
    email: 68,
    seo: 25,
    other: 7,
  },
  roi: "4.4x",
  highlights: [
    "邮件回复率创新高（4.5%），主题行优化效果显著",
    "SEO文章开始带来稳定自然流量",
  ],
  suggestions: [
    "建议增加1篇SEO文章/周，可进一步提升自然流量",
    "高意向线索集中在Email渠道，建议加大该渠道投入",
  ],
};

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
        content: "✅ 获客任务已启动！\n\n• SEO Agent：正在生成首篇 SEO 文章...\n• Email Agent：正在筛选目标客户...\n\n我会每天 18:00 向您汇报进展。\n\n您可以随时问我：\n- 「任务进展如何」查看实时状态\n- 「查看线索」查看已获得的线索\n- 「@SEO Agent 生成文章」直接操作SEO任务",
        timestamp: new Date(),
      },
    ],
  },
];

export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTask, setActiveTask] = useState<string>("onboarding");
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { agent: "supervisor", name: "主管 Agent", status: "working", task: "Onboarding", progress: 35 },
    { agent: "seo", name: "SEO Agent", status: "idle", progress: 0 },
    { agent: "email", name: "Email Agent", status: "idle", progress: 0 },
    { agent: "whatsapp", name: "WhatsApp Agent", status: "idle", progress: 0 },
    { agent: "lead", name: "线索 Agent", status: "idle", progress: 0 },
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

      // Special commands
      const lowerText = text.toLowerCase();
      
      // Check for progress query
      if (lowerText.includes("进展") || lowerText.includes("进度") || lowerText.includes("status")) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: "以下是您的获客任务进展（美国户外用品批发商）：",
              card: {
                type: "task-progress",
                data: {
                  taskName: "美国户外用品批发商",
                  status: "执行中",
                  daysRunning: 15,
                  seo: {
                    articlesPublished: 6,
                    keywordsRanked: 3,
                    traffic: 320,
                    growth: "+25%",
                    progress: 45,
                  },
                  email: {
                    sent: 450,
                    delivered: 96,
                    opened: 28,
                    replied: 4.2,
                    progress: 60,
                  },
                  leads: {
                    total: 23,
                    target: 30,
                    highIntent: 8,
                    percentage: 77,
                  },
                  suggestion: "Email打开率良好，建议优化主题行以提升回复率",
                },
                actions: [
                  { label: "查看详情", id: "view-details", variant: "secondary" },
                  { label: "导出报表", id: "export-report", variant: "primary" },
                ],
              },
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 1500);
        return;
      }

      // Check for leads query
      if (lowerText.includes("线索") || lowerText.includes("lead") || lowerText.includes("客户")) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: "🔥 发现新的高意向线索！以下是您的线索收件箱：",
              card: {
                type: "lead-summary",
                data: {
                  total: leads.length,
                  new: leads.filter(l => l.status === "new").length,
                  highIntent: leads.filter(l => l.score >= 80).length,
                  leads: leads,
                },
                actions: [
                  { label: "查看全部", id: "view-all-leads", variant: "secondary" },
                  { label: "导出Excel", id: "export-leads", variant: "primary" },
                ],
              },
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 1500);
        return;
      }

      // Check for dashboard/effect query
      if (lowerText.includes("效果") || lowerText.includes("数据") || lowerText.includes("dashboard") || lowerText.includes("本周")) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: `以下是${MOCK_DASHBOARD.period}的获客效果数据：`,
              card: {
                type: "data-dashboard",
                data: MOCK_DASHBOARD,
                actions: [
                  { label: "查看上月对比", id: "compare-last-month", variant: "secondary" },
                  { label: "导出报表", id: "export-dashboard", variant: "primary" },
                ],
              },
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 1500);
        return;
      }

      // Check for @Agent commands
      if (lowerText.includes("@seo") || lowerText.includes("seo agent")) {
        handleSEOCommand(text);
        return;
      }

      if (lowerText.includes("@email") || lowerText.includes("email agent")) {
        handleEmailCommand(text);
        return;
      }

      // Find matching flow
      const currentFlow = DEMO_FLOW[flowIndex.current];
      if (currentFlow && text.includes(currentFlow.trigger)) {
        flowIndex.current++;
        addMessages(currentFlow.responses);

        // Update agent statuses based on flow
        if (flowIndex.current >= 5) {
          setAgentStatuses((prev) =>
            prev.map((a) =>
              a.agent === "seo" ? { ...a, status: "working", task: "制定内容策略", progress: 30 } :
              a.agent === "email" ? { ...a, status: "working", task: "筛选目标客户", progress: 40 } : a
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
              content: "收到您的消息。您可以尝试以下指令：\n• 「任务进展如何」查看实时状态\n• 「查看线索」查看已获得的线索\n• 「本周效果如何」查看数据看板\n• 「@SEO Agent 生成文章」操作SEO任务\n• 「@Email Agent 查看客户」操作邮件任务",
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 1000);
      }
    },
    [addMessages, leads]
  );

  const handleSEOCommand = (text: string) => {
    setTimeout(() => {
      setIsTyping(false);
      
      if (text.includes("关键词") || text.includes("keyword")) {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}-seo`,
            role: "agent",
            agent: "seo",
            content: "已为您分析目标关键词（基于您的产品和市场）：",
            card: {
              type: "seo-strategy",
              data: {
                keywords: MOCK_KEYWORDS,
                contentPlan: [
                  { week: 1, topic: "2024年露营装备市场趋势", status: "已生成" },
                  { week: 2, topic: "如何选择可靠的户外用品供应商", status: "待生成" },
                  { week: 3, topic: "批发露营帐篷的5个关键考量因素", status: "待生成" },
                  { week: 4, topic: "OEM定制睡袋的生产流程详解", status: "待生成" },
                ],
                expectations: {
                  ranking: "3个月内目标关键词进入前20页",
                  traffic: "月均自然流量：500-800访客",
                  leads: "月均转化线索：5-8条",
                },
              },
              actions: [
                { label: "调整策略", id: "adjust-seo", variant: "secondary" },
                { label: "📝 查看首篇文章", id: "view-article", variant: "primary" },
              ],
            },
            timestamp: new Date(),
          },
        ]);
      } else if (text.includes("文章") || text.includes("article") || text.includes("生成")) {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}-seo-article`,
            role: "agent",
            agent: "seo",
            content: "已为您生成首篇SEO文章：",
            card: {
              type: "seo-article",
              data: MOCK_ARTICLE,
              actions: [
                { label: "✏️ 编辑", id: "edit-article", variant: "secondary" },
                { label: "👁️ 预览", id: "preview-article", variant: "secondary" },
                { label: "🚀 发布", id: "publish-article", variant: "primary" },
              ],
            },
            timestamp: new Date(),
          },
        ]);
        setAgentStatuses((prev) =>
          prev.map((a) =>
            a.agent === "seo" ? { ...a, status: "working", task: "生成SEO文章", progress: 65 } : a
          )
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}-seo-help`,
            role: "agent",
            agent: "seo",
            content: "我是 SEO Agent，可以帮助您：\n• 生成内容策略和关键词建议\n• 创建SEO优化文章\n• 发布到您的独立站\n\n请告诉我您需要什么帮助？",
            timestamp: new Date(),
          },
        ]);
      }
    }, 1200);
  };

  const handleEmailCommand = (text: string) => {
    setTimeout(() => {
      setIsTyping(false);
      
      if (text.includes("客户") || text.includes("列表") || text.includes("customer")) {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}-email-customers`,
            role: "agent",
            agent: "email",
            content: "已为您筛选目标客户并生成开发信：",
            card: {
              type: "customer-list",
              data: {
                total: 856,
                conditions: {
                  region: "美国",
                  industry: "户外用品批发",
                  size: "50-200人",
                  purchase: "100万-500万美元",
                },
                customers: MOCK_CUSTOMERS,
                strategy: {
                  targetCount: 800,
                  dailySend: 30,
                  duration: 27,
                  time: "美国时间周二-周四 9:00-11:00",
                  channel: "平台代发（送达率95%+）",
                },
              },
              actions: [
                { label: "调整筛选", id: "adjust-filter", variant: "secondary" },
                { label: "预览邮件", id: "preview-email", variant: "secondary" },
                { label: "🚀 启动发送", id: "start-sending", variant: "primary" },
              ],
            },
            timestamp: new Date(),
          },
        ]);
      } else if (text.includes("邮件") || text.includes("预览") || text.includes("preview")) {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}-email-preview`,
            role: "agent",
            agent: "email",
            content: "这是给 Outdoor Gear Co. 的个性化开发信预览：",
            card: {
              type: "email-preview",
              data: {
                template: MOCK_EMAIL_TEMPLATE,
                customer: MOCK_CUSTOMERS[0],
                highlights: [
                  "提及客户公司最新动态（新店开业）",
                  "引用客户主营产品类别",
                  "匹配客户所在地区（加州）",
                ],
                score: 92,
              },
              actions: [
                { label: "✏️ 编辑", id: "edit-email", variant: "secondary" },
                { label: "🔄 换一版", id: "regenerate-email", variant: "secondary" },
                { label: "👍 确认", id: "confirm-email", variant: "primary" },
              ],
            },
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}-email-help`,
            role: "agent",
            agent: "email",
            content: "我是 Email Agent，可以帮助您：\n• 筛选目标客户列表\n• 生成个性化开发信\n• 预览邮件效果\n• 设置发送策略\n\n请告诉我您需要什么帮助？",
            timestamp: new Date(),
          },
        ]);
      }
    }, 1200);
  };

  const handleCardAction = useCallback(
    (actionId: string) => {
      // Check flow actions
      const currentFlow = DEMO_FLOW[flowIndex.current];
      if (currentFlow && actionId === currentFlow.trigger) {
        flowIndex.current++;
        setIsTyping(true);
        addMessages(currentFlow.responses);
        return;
      }

      // Handle specific card actions
      switch (actionId) {
        case "view-article":
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: "已为您生成首篇SEO文章：",
              card: {
                type: "seo-article",
                data: MOCK_ARTICLE,
                actions: [
                  { label: "✏️ 编辑", id: "edit-article", variant: "secondary" },
                  { label: "👁️ 预览", id: "preview-article", variant: "secondary" },
                  { label: "🚀 发布", id: "publish-article", variant: "primary" },
                ],
              },
              timestamp: new Date(),
            },
          ]);
          break;
        
        case "preview-email":
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "email",
              content: "这是给 Outdoor Gear Co. 的个性化开发信预览：",
              card: {
                type: "email-preview",
                data: {
                  template: MOCK_EMAIL_TEMPLATE,
                  customer: MOCK_CUSTOMERS[0],
                  highlights: [
                    "提及客户公司最新动态（新店开业）",
                    "引用客户主营产品类别",
                    "匹配客户所在地区（加州）",
                  ],
                  score: 92,
                },
                actions: [
                  { label: "✏️ 编辑", id: "edit-email", variant: "secondary" },
                  { label: "🔄 换一版", id: "regenerate-email", variant: "secondary" },
                  { label: "👍 确认", id: "confirm-email", variant: "primary" },
                ],
              },
              timestamp: new Date(),
            },
          ]);
          break;

        case "publish-article":
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: "✅ 文章已发布！\n\n• 已发布到您的独立站\n• 已提交搜索引擎收录\n• 预计3-7天被收录并开始获得流量\n\n我会持续监控这篇文章的排名表现。",
              timestamp: new Date(),
            },
          ]);
          setAgentStatuses((prev) =>
            prev.map((a) =>
              a.agent === "seo" ? { ...a, status: "done", task: "文章已发布", progress: 100 } : a
            )
          );
          break;

        case "start-sending":
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "email",
              content: "✅ 邮件发送已启动！\n\n• 首日发送10封（冷启动期）\n• 发送时间：美国时间周二-周四 9:00-11:00\n• 目标客户：Outdoor Gear Co. 等800家企业\n\n我会实时监控送达率和回复情况。",
              timestamp: new Date(),
            },
          ]);
          setAgentStatuses((prev) =>
            prev.map((a) =>
              a.agent === "email" ? { ...a, status: "working", task: "邮件发送中", progress: 15 } : a
            )
          );
          break;

        case "view-all-leads":
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "lead",
              content: `📋 线索收件箱 - 共 ${leads.length} 条线索\n\n🔥 高意向线索（评分80+）：${leads.filter(l => l.score >= 80).length} 条\n📧 Email渠道：${leads.filter(l => l.source === "email").length} 条\n🔍 SEO渠道：${leads.filter(l => l.source === "seo").length} 条`,
              timestamp: new Date(),
            },
          ]);
          break;

        default:
          // Generic acknowledgment
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: `已收到您的操作：${actionId}。该功能正在完善中，敬请期待！`,
              timestamp: new Date(),
            },
          ]);
      }
    },
    [addMessages, leads]
  );

  return {
    messages,
    isTyping,
    sendMessage,
    handleCardAction,
    activeTask,
    setActiveTask,
    agentStatuses,
    leads,
  };
}
