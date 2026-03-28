import { useState, useCallback, useRef } from "react";

export type MessageRole = "user" | "agent" | "system";
export type AgentType = "supervisor" | "seo" | "email" | "whatsapp" | "lead";
export type CardType = 
  | "company-profile" 
  | "company-profile-edit"
  | "customer-persona"
  | "customer-persona-edit"
  | "acquisition-plan"
  | "acquisition-plan-edit"
  | "seo-strategy"
  | "seo-article"
  | "seo-article-edit"
  | "site-connection"
  | "article-analytics"
  | "competitor-analysis"
  | "site-generator"
  | "seo-health"
  | "keyword-recommend"
  | "email-preview"
  | "customer-list"
  | "lead-summary"
  | "lead-detail"
  | "reply-suggestion"
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
  decisionMaker?: string;
  interactions?: Interaction[];
}

export interface Interaction {
  type: "email_sent" | "email_opened" | "email_replied" | "site_visit" | "whatsapp";
  timestamp: string;
  details?: string;
}

export interface CompanyProfile {
  category: string;
  advantage: string;
  market: string;
  targetCustomer: string;
  priceRange: string;
}

export interface CustomerPersona {
  region: string;
  industry: string;
  scale: string;
  purchaseVolume: string;
  decisionMaker: string;
  timeline: string;
}

// Intent Recognition Types
type IntentType = 
  | 'ONBOARDING_INDUSTRY'
  | 'ONBOARDING_MARKET'
  | 'CREATE_TASK'
  | 'TASK_DETAIL'
  | 'CONFIRM_PROFILE'
  | 'CONFIRM_PERSONA'
  | 'CONFIRM_PLAN'
  | 'QUERY_PROGRESS'
  | 'QUERY_LEADS'
  | 'QUERY_DASHBOARD'
  | 'SEO_KEYWORDS'
  | 'SEO_ARTICLE'
  | 'SEO_PUBLISH'
  | 'SEO_EDIT'
  | 'SEO_ANALYTICS'
  | 'SEO_COMPETITOR'
  | 'SEO_GENERATE_SITE'
  | 'SEO_HEALTH'
  | 'SEO_KEYWORD_RECOMMEND'
  | 'SEO_SITE_CONNECTION'
  | 'EMAIL_CUSTOMERS'
  | 'EMAIL_PREVIEW'
  | 'EMAIL_SEND'
  | 'HELP'
  | 'UNKNOWN';

interface Intent {
  type: IntentType;
  confidence: number;
  data?: Record<string, any>;
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

// Mock data
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
  metaDescription: "探索2024年露营装备市场最新趋势，了解批发商如何把握机遇，获取高质量潜在客户。",
  keywords: ["wholesale camping gear", "outdoor equipment", "camping tents bulk", "sleeping bags wholesale"],
  wordCount: 1850,
  lastModified: new Date().toISOString(),
};

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

const MOCK_DASHBOARD = {
  period: "本周 (3/20 - 3/27)",
  leads: { current: 28, last: 22, change: "+27%" },
  highIntent: { current: 10, last: 7, change: "+43%" },
  costPerLead: { current: "¥98", last: "¥105", change: "-7%" },
  replyRate: { current: "4.5%", last: "3.8%", change: "+18%" },
  traffic: { current: 520, last: 410, change: "+27%" },
  sourceDistribution: { email: 68, seo: 25, other: 7 },
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

// Intent Recognition Functions
const recognizeIntent = (text: string, context: {
  hasCompanyProfile: boolean;
  hasCustomerPersona: boolean;
  hasActiveTask: boolean;
}): Intent => {
  const lowerText = text.toLowerCase().trim();
  
  // Confirmation actions
  if (lowerText === 'confirm-profile' || lowerText.includes('确认无误') || lowerText.includes('确认画像')) {
    return { type: 'CONFIRM_PROFILE', confidence: 0.95 };
  }
  
  if (lowerText === 'confirm-persona' || lowerText.includes('确认客户') || (lowerText.includes('确认') && context.hasCompanyProfile && !context.hasCustomerPersona)) {
    return { type: 'CONFIRM_PERSONA', confidence: 0.9 };
  }
  
  if (lowerText === 'confirm-plan' || lowerText.includes('确认执行') || lowerText.includes('启动')) {
    return { type: 'CONFIRM_PLAN', confidence: 0.95 };
  }
  
  // Onboarding intents
  if (!context.hasCompanyProfile) {
    if (lowerText.includes('户外') || lowerText.includes('电子') || lowerText.includes('服装') || 
        lowerText.includes('机械') || lowerText.includes('家居') || lowerText.includes('做')) {
      return { type: 'ONBOARDING_INDUSTRY', confidence: 0.85 };
    }
    if (lowerText.includes('美国') || lowerText.includes('北美') || lowerText.includes('欧洲') || 
        lowerText.includes('日本') || lowerText.includes('东南亚') || lowerText.includes('出口')) {
      return { type: 'ONBOARDING_MARKET', confidence: 0.85 };
    }
  }
  
  // Task creation intents
  if (lowerText.includes('找') || lowerText.includes('搜索') || lowerText.includes('获客') || 
      lowerText.includes('开发') || lowerText.includes('寻找')) {
    return { type: 'CREATE_TASK', confidence: 0.9 };
  }
  
  if (lowerText.includes('万') || lowerText.includes('采购') || lowerText.includes('预算') || 
      lowerText.includes('美元') || lowerText.includes('规模')) {
    return { type: 'TASK_DETAIL', confidence: 0.8 };
  }
  
  // Query intents
  if (lowerText.includes('进展') || lowerText.includes('进度') || lowerText.includes('status') || 
      lowerText.includes('如何') || lowerText.includes('怎么样')) {
    return { type: 'QUERY_PROGRESS', confidence: 0.95 };
  }
  
  if (lowerText.includes('线索') || lowerText.includes('lead') || lowerText.includes('客户') || 
      lowerText.includes('商机')) {
    return { type: 'QUERY_LEADS', confidence: 0.95 };
  }
  
  if (lowerText.includes('效果') || lowerText.includes('数据') || lowerText.includes('dashboard') || 
      lowerText.includes('统计') || lowerText.includes('本周') || lowerText.includes('本月')) {
    return { type: 'QUERY_DASHBOARD', confidence: 0.9 };
  }
  
  // SEO Agent commands
  if (lowerText.includes('@seo') || lowerText.includes('seo agent')) {
    // 注意：更具体的匹配条件要放在前面，避免被更宽泛的条件拦截
    if (lowerText.includes('关键词') || lowerText.includes('keyword') || lowerText.includes('策略')) {
      return { type: 'SEO_KEYWORDS', confidence: 0.9 };
    }
    // 生成站点要放在生成文章之前检查，因为"生成站点"包含"生成"关键词
    if (lowerText.includes('建站') || lowerText.includes('生成站点') || lowerText.includes('site generator')) {
      return { type: 'SEO_GENERATE_SITE', confidence: 0.9 };
    }
    if (lowerText.includes('文章') || lowerText.includes('article') || lowerText.includes('生成') || lowerText.includes('内容')) {
      return { type: 'SEO_ARTICLE', confidence: 0.9 };
    }
    if (lowerText.includes('发布') || lowerText.includes('publish') || lowerText.includes('上线')) {
      return { type: 'SEO_PUBLISH', confidence: 0.9 };
    }
    if (lowerText.includes('编辑') || lowerText.includes('修改') || lowerText.includes('edit')) {
      return { type: 'SEO_EDIT', confidence: 0.9 };
    }
    if (lowerText.includes('数据') || lowerText.includes('效果') || lowerText.includes('分析') || lowerText.includes('analytics')) {
      return { type: 'SEO_ANALYTICS', confidence: 0.9 };
    }
    if (lowerText.includes('竞品') || lowerText.includes('竞争') || lowerText.includes('competitor')) {
      return { type: 'SEO_COMPETITOR', confidence: 0.9 };
    }
    // 单独检查"网站"关键词（不包含"生成站点"的情况）
    if (lowerText.includes('网站') && !lowerText.includes('生成站点')) {
      return { type: 'SEO_GENERATE_SITE', confidence: 0.85 };
    }
    if (lowerText.includes('健康') || lowerText.includes('监控') || lowerText.includes('health') || lowerText.includes('check')) {
      return { type: 'SEO_HEALTH', confidence: 0.9 };
    }
    if (lowerText.includes('推荐') || lowerText.includes('选词') || lowerText.includes('recommend')) {
      return { type: 'SEO_KEYWORD_RECOMMEND', confidence: 0.9 };
    }
    if (lowerText.includes('连接') || lowerText.includes('绑定') || lowerText.includes('绑定站点') || lowerText.includes('wordpress') || lowerText.includes('shopify')) {
      return { type: 'SEO_SITE_CONNECTION', confidence: 0.9 };
    }
  }
  
  // Email Agent commands
  if (lowerText.includes('@email') || lowerText.includes('email agent')) {
    if (lowerText.includes('客户') || lowerText.includes('列表') || lowerText.includes('customer') || 
        lowerText.includes('筛选') || lowerText.includes('目标')) {
      return { type: 'EMAIL_CUSTOMERS', confidence: 0.9 };
    }
    if (lowerText.includes('邮件') || lowerText.includes('预览') || lowerText.includes('preview') || 
        lowerText.includes('开发信')) {
      return { type: 'EMAIL_PREVIEW', confidence: 0.9 };
    }
    if (lowerText.includes('发送') || lowerText.includes('启动')) {
      return { type: 'EMAIL_SEND', confidence: 0.9 };
    }
  }
  
  // Help
  if (lowerText.includes('帮助') || lowerText.includes('help') || lowerText.includes('怎么用') || 
      lowerText.includes('指令') || lowerText.includes('功能')) {
    return { type: 'HELP', confidence: 0.9 };
  }
  
  return { type: 'UNKNOWN', confidence: 0 };
};

export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTask, setActiveTask] = useState<string>("onboarding");
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [customerPersona, setCustomerPersona] = useState<CustomerPersona | null>(null);
  const [editingCard, setEditingCard] = useState<{ type: CardType; data: Record<string, any> } | null>(null);
  const [taskStarted, setTaskStarted] = useState(false);
  
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { agent: "supervisor", name: "主管 Agent", status: "working", task: "Onboarding", progress: 35 },
    { agent: "seo", name: "SEO Agent", status: "idle", progress: 0 },
    { agent: "email", name: "Email Agent", status: "idle", progress: 0 },
    { agent: "whatsapp", name: "WhatsApp Agent", status: "idle", progress: 0 },
    { agent: "lead", name: "线索 Agent", status: "idle", progress: 0 },
  ]);
  
  const flowIndex = useRef(0);
  const processingRef = useRef(false);

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

  const addSingleMessage = useCallback((msg: ChatMessage, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
      setIsTyping(false);
    }, delay);
  }, []);

  // BUG FIX-001: Validate empty messages
  const sendMessage = useCallback(
    (text: string) => {
      // Validate empty or whitespace-only messages
      const trimmedText = text.trim();
      if (!trimmedText) {
        return; // Reject empty messages
      }

      // Prevent duplicate processing
      if (processingRef.current) return;
      processingRef.current = true;
      setTimeout(() => { processingRef.current = false; }, 500);

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Intent recognition
      const intent = recognizeIntent(trimmedText, {
        hasCompanyProfile: !!companyProfile,
        hasCustomerPersona: !!customerPersona,
        hasActiveTask: taskStarted,
      });

      handleIntent(intent, trimmedText);
    },
    [companyProfile, customerPersona, taskStarted]
  );

  const handleIntent = useCallback((intent: Intent, text: string) => {
    switch (intent.type) {
      case 'ONBOARDING_INDUSTRY':
        handleOnboardingIndustry(text);
        break;
      case 'ONBOARDING_MARKET':
        handleOnboardingMarket(text);
        break;
      case 'CONFIRM_PROFILE':
        handleConfirmProfile();
        break;
      case 'CREATE_TASK':
        handleCreateTask(text);
        break;
      case 'TASK_DETAIL':
        handleTaskDetail(text);
        break;
      case 'CONFIRM_PERSONA':
        handleConfirmPersona();
        break;
      case 'CONFIRM_PLAN':
        handleConfirmPlan();
        break;
      case 'QUERY_PROGRESS':
        handleQueryProgress();
        break;
      case 'QUERY_LEADS':
        handleQueryLeads();
        break;
      case 'QUERY_DASHBOARD':
        handleQueryDashboard();
        break;
      case 'SEO_KEYWORDS':
        handleSEOKeywords();
        break;
      case 'SEO_ARTICLE':
        handleSEOArticle();
        break;
      case 'SEO_PUBLISH':
        handleSEOPublish();
        break;
      case 'SEO_EDIT':
        handleSEOEdit();
        break;
      case 'SEO_ANALYTICS':
        handleSEOAnalytics();
        break;
      case 'SEO_COMPETITOR':
        handleSEOCompetitor();
        break;
      case 'SEO_GENERATE_SITE':
        handleSEOGenerateSite();
        break;
      case 'SEO_HEALTH':
        handleSEOHealth();
        break;
      case 'SEO_KEYWORD_RECOMMEND':
        handleSEOKeywordRecommend();
        break;
      case 'SEO_SITE_CONNECTION':
        handleSEOSiteConnection();
        break;
      case 'EMAIL_CUSTOMERS':
        handleEmailCustomers();
        break;
      case 'EMAIL_PREVIEW':
        handleEmailPreview();
        break;
      case 'EMAIL_SEND':
        handleEmailSend();
        break;
      case 'HELP':
        handleHelp();
        break;
      default:
        handleDefaultResponse();
    }
  }, [companyProfile, customerPersona, taskStarted, leads]);

  // Handlers
  const handleOnboardingIndustry = (text: string) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "了解了！户外用品是个很好的出口领域。您主要出口哪些市场？目标客户类型是批发商还是品牌商？",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOnboardingMarket = (text: string) => {
    // Extract market info
    const hasUS = text.includes('美国') || text.includes('北美');
    const hasEU = text.includes('欧洲');
    const market = hasUS && hasEU ? '北美、欧洲' : hasUS ? '北美' : hasEU ? '欧洲' : '全球';
    
    const profile: CompanyProfile = {
      category: "户外用品（帐篷/睡袋/登山装备）",
      advantage: "自有工厂、OEM定制、通过ISO认证",
      market: market,
      targetCustomer: "批发商、品牌商",
      priceRange: "中高端",
    };
    
    setCompanyProfile(profile);
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "好的！基于我们的对话，以下是我对贵公司的理解：",
          card: {
            type: "company-profile",
            data: profile,
            actions: [
              { label: "编辑修改", id: "edit-profile", variant: "secondary" },
              { label: "✓ 确认无误", id: "confirm-profile", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleConfirmProfile = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "已了解您的企业！现在您可以告诉我您的获客目标。\n\n例如：「帮我找美国户外用品批发商」",
          timestamp: new Date(),
        },
      ]);
      setAgentStatuses((prev) =>
        prev.map((a) =>
          a.agent === "supervisor" ? { ...a, status: "idle" as const, task: undefined, progress: 100 } : a
        )
      );
      setIsTyping(false);
    }, 500);
  };

  const handleCreateTask = (text: string) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "收到！我来为您创建获客任务。\n\n基于您的企业画像（户外用品出口商）：\n• 目标地区：美国\n• 行业：户外用品\n• 客户类型：批发商\n\n让我确认几个细节：\n1. 目标客户年采购额大概？\n2. 期望多长时间看到效果？",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleTaskDetail = (text: string) => {
    // Extract volume
    const volumeMatch = text.match(/(\d+)[\s-]*(\d+)*\s*[万]/);
    const volume = volumeMatch ? (volumeMatch[2] ? `${volumeMatch[1]}-${volumeMatch[2]}万` : `${volumeMatch[1]}万`) : "100-500万";
    
    const timeline = text.includes('3') ? '3个月内' : text.includes('6') ? '6个月内' : '3个月内';
    
    const persona: CustomerPersona = {
      region: "美国",
      industry: "户外用品批发",
      scale: "中型（50-200人）",
      purchaseVolume: `${volume}美元/年`,
      decisionMaker: "采购经理/采购总监",
      timeline: timeline,
    };
    
    setCustomerPersona(persona);
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "了解了！这是您的目标客户画像：",
          card: {
            type: "customer-persona",
            data: persona,
            actions: [
              { label: "编辑", id: "edit-persona", variant: "secondary" },
              { label: "✓ 确认无误", id: "confirm-persona", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleConfirmPersona = () => {
    addSingleMessage({
      id: `system-${Date.now()}`,
      role: "system",
      content: "正在协调 SEO Agent 和 Email Agent 制定方案...",
      timestamp: new Date(),
    }, 800);
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
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
      ]);
      setIsTyping(false);
    }, 2500);
  };

  const handleConfirmPlan = () => {
    setTaskStarted(true);
    setActiveTask("acquisition");
    
    setAgentStatuses((prev) =>
      prev.map((a) =>
        a.agent === "seo" ? { ...a, status: "working" as const, task: "制定内容策略", progress: 30 } :
        a.agent === "email" ? { ...a, status: "working" as const, task: "筛选目标客户", progress: 40 } : a
      )
    );
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "✅ 获客任务已启动！\n\n• SEO Agent：正在生成首篇 SEO 文章...\n• Email Agent：正在筛选目标客户...\n\n我会每天 18:00 向您汇报进展。\n\n您可以随时问我：\n- 「任务进展如何」查看实时状态\n- 「查看线索」查看已获得的线索\n- 「@SEO Agent 生成文章」直接操作SEO任务",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQueryProgress = () => {
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
  };

  const handleQueryLeads = () => {
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
  };

  const handleQueryDashboard = () => {
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
  };

  const handleSEOKeywords = () => {
    setTimeout(() => {
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
      setIsTyping(false);
    }, 1200);
  };

  const handleSEOArticle = () => {
    setTimeout(() => {
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
          a.agent === "seo" ? { ...a, status: "working" as const, task: "生成SEO文章", progress: 65 } : a
        )
      );
      setIsTyping(false);
    }, 1200);
  };

  const handleSEOPublish = () => {
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
        a.agent === "seo" ? { ...a, status: "done" as const, task: "文章已发布", progress: 100 } : a
      )
    );
    setIsTyping(false);
  };

  const handleSEOEdit = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "seo",
          content: "请编辑您的SEO文章：",
          card: {
            type: "seo-article-edit",
            data: { article: MOCK_ARTICLE },
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleSEOAnalytics = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "seo",
          content: "📊 以下是您最近发布文章的效果数据：",
          card: {
            type: "article-analytics",
            data: {
              articles: [
                {
                  id: "1",
                  title: "2024年露营装备市场趋势：批发商如何把握机遇",
                  publishDate: "2026-03-25",
                  totalViews: 1247,
                  totalClicks: 89,
                  ctr: 7.1,
                  avgTime: "3:24",
                  ranking: 8,
                  keywords: ["wholesale camping gear", "camping equipment bulk", "outdoor gear wholesale"],
                  weeklyData: [
                    { date: "2026-03-21", views: 120, clicks: 8, avgTime: 180, bounceRate: 35 },
                    { date: "2026-03-22", views: 156, clicks: 12, avgTime: 195, bounceRate: 32 },
                    { date: "2026-03-23", views: 189, clicks: 14, avgTime: 210, bounceRate: 28 },
                    { date: "2026-03-24", views: 234, clicks: 18, avgTime: 204, bounceRate: 30 },
                    { date: "2026-03-25", views: 267, clicks: 19, avgTime: 215, bounceRate: 26 },
                    { date: "2026-03-26", views: 156, clicks: 10, avgTime: 190, bounceRate: 34 },
                    { date: "2026-03-27", views: 125, clicks: 8, avgTime: 185, bounceRate: 36 },
                  ],
                },
                {
                  id: "2",
                  title: "如何选择可靠的户外用品供应商",
                  publishDate: "2026-03-20",
                  totalViews: 892,
                  totalClicks: 56,
                  ctr: 6.3,
                  avgTime: "2:48",
                  ranking: 12,
                  keywords: ["outdoor gear supplier", "camping equipment manufacturer", "wholesale outdoor products"],
                  weeklyData: [
                    { date: "2026-03-21", views: 98, clicks: 6, avgTime: 160, bounceRate: 38 },
                    { date: "2026-03-22", views: 112, clicks: 7, avgTime: 165, bounceRate: 36 },
                    { date: "2026-03-23", views: 134, clicks: 8, avgTime: 170, bounceRate: 35 },
                    { date: "2026-03-24", views: 145, clicks: 9, avgTime: 168, bounceRate: 37 },
                    { date: "2026-03-25", views: 156, clicks: 10, avgTime: 172, bounceRate: 34 },
                    { date: "2026-03-26", views: 134, clicks: 8, avgTime: 165, bounceRate: 36 },
                    { date: "2026-03-27", views: 113, clicks: 8, avgTime: 162, bounceRate: 38 },
                  ],
                },
              ],
              timeRange: "7d",
            },
            actions: [
              { label: "导出报告", id: "export-analytics", variant: "secondary" },
              { label: "优化文章", id: "optimize-articles", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSEOCompetitor = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "seo",
          content: "🕵️ 竞品SEO分析完成！以下是您的竞争对手情报：",
          card: {
            type: "competitor-analysis",
            data: {
              competitors: [
                {
                  id: "1",
                  domain: "outdoorwholesale.com",
                  domainAuthority: 42,
                  backlinkCount: 2850,
                  topKeywords: ["wholesale camping gear", "bulk outdoor equipment", "camping supplies distributor"],
                  monthlyTraffic: "45K",
                  contentStrategy: "每周发布3-4篇长文，重点覆盖产品对比和选购指南",
                  weaknesses: ["移动端体验一般", "页面加载速度较慢", "缺乏视频内容"],
                  opportunities: ["加强视频营销", "优化移动端体验", "开发长尾关键词"],
                },
                {
                  id: "2",
                  domain: "campingsupplypro.com",
                  domainAuthority: 38,
                  backlinkCount: 1920,
                  topKeywords: ["camping gear wholesale", "outdoor gear bulk", "tent wholesale supplier"],
                  monthlyTraffic: "32K",
                  contentStrategy: "专注产品评测和技术指南，内容深度较高",
                  weaknesses: ["社交信号弱", "内容更新频率低", "内链结构混乱"],
                  opportunities: ["增加社交媒体推广", "提高内容更新频率", "重建内链结构"],
                },
              ],
              keywordGaps: [
                { keyword: "eco-friendly camping gear wholesale", ourRank: null, competitorRank: 5, searchVolume: "720", difficulty: "medium", opportunity: "high" },
                { keyword: "lightweight tent bulk order", ourRank: 15, competitorRank: 3, searchVolume: "480", difficulty: "easy", opportunity: "high" },
                { keyword: "camping equipment dropshipping", ourRank: 22, competitorRank: 8, searchVolume: "1.2K", difficulty: "medium", opportunity: "medium" },
                { keyword: "custom branded outdoor gear", ourRank: null, competitorRank: 6, searchVolume: "890", difficulty: "hard", opportunity: "medium" },
                { keyword: "family camping package wholesale", ourRank: 18, competitorRank: 4, searchVolume: "650", difficulty: "easy", opportunity: "high" },
              ],
              industry: "Outdoor Gear & Camping Equipment",
              analyzedAt: new Date().toISOString(),
            },
            actions: [
              { label: "导出报告", id: "export-competitor-report", variant: "secondary" },
              { label: "生成应对策略", id: "generate-strategy", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSEOGenerateSite = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "seo",
          content: "🚀 让我为您一键生成专业的营销独立站：",
          card: {
            type: "site-generator",
            data: { companyProfile },
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleSEOHealth = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "seo",
          content: "🏥 SEO健康检查报告：",
          card: {
            type: "seo-health",
            data: {
              siteHealth: {
                overallScore: 78,
                status: "needs_attention",
                lastScan: new Date().toISOString(),
                checks: [
                  {
                    id: "ssl",
                    name: "SSL证书",
                    category: "technical",
                    status: "passed",
                    score: 100,
                    issues: [],
                  },
                  {
                    id: "sitemap",
                    name: "网站地图",
                    category: "technical",
                    status: "passed",
                    score: 95,
                    issues: [],
                  },
                  {
                    id: "mobile",
                    name: "移动适配",
                    category: "technical",
                    status: "warning",
                    score: 75,
                    issues: [
                      { type: "warning", message: "部分页面在移动设备上字体过小", recommendation: "调整字体大小至至少16px" },
                    ],
                  },
                  {
                    id: "speed",
                    name: "页面速度",
                    category: "performance",
                    status: "warning",
                    score: 68,
                    issues: [
                      { type: "warning", message: "首页加载时间2.8秒", recommendation: "优化图片大小和启用CDN" },
                      { type: "info", message: "可以启用浏览器缓存", recommendation: "配置缓存策略" },
                    ],
                  },
                  {
                    id: "meta",
                    name: "Meta标签",
                    category: "content",
                    status: "failed",
                    score: 45,
                    issues: [
                      { type: "critical", message: "3个页面缺少Meta描述", recommendation: "为所有页面添加描述性Meta标签" },
                      { type: "warning", message: "部分标题超过60字符", recommendation: "缩短标题至50-60字符" },
                    ],
                  },
                  {
                    id: "links",
                    name: "内外链健康",
                    category: "links",
                    status: "passed",
                    score: 85,
                    issues: [
                      { type: "info", message: "发现2个外部链接失效", recommendation: "更新或移除失效链接" },
                    ],
                  },
                ],
                metrics: {
                  crawlablePages: 45,
                  indexedPages: 42,
                  brokenLinks: 2,
                  duplicateContent: 1,
                  missingMeta: 3,
                  slowPages: 4,
                },
              },
            },
            actions: [
              { label: "详细报告", id: "view-detailed-health", variant: "secondary" },
              { label: "一键修复", id: "fix-all-issues", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSEOKeywordRecommend = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "seo",
          content: "🔍 基于您的产品和行业，我为您推荐了以下关键词：",
          card: {
            type: "keyword-recommend",
            data: {
              topic: "wholesale outdoor camping gear",
              keywords: [
                { id: "1", term: "wholesale camping tents", volume: "1,300", difficulty: "medium", cpc: "$2.50", intent: "commercial", competition: "medium", trend: "up", relevance: 95, relatedTerms: ["bulk camping tents", "camping tent wholesale supplier", "wholesale tent manufacturer"] },
                { id: "2", term: "bulk sleeping bags", volume: "890", difficulty: "easy", cpc: "$1.80", intent: "transactional", competition: "low", trend: "up", relevance: 92, relatedTerms: ["sleeping bag wholesale", "bulk sleeping bag order", "sleeping bag distributor"] },
                { id: "3", term: "outdoor gear distributor", volume: "720", difficulty: "medium", cpc: "$3.20", intent: "commercial", competition: "medium", trend: "stable", relevance: 88, relatedTerms: ["camping gear distributor", "outdoor equipment supplier", "camping supplies wholesale"] },
                { id: "4", term: "camping equipment wholesale", volume: "2,100", difficulty: "hard", cpc: "$4.50", intent: "commercial", competition: "high", trend: "up", relevance: 90, relatedTerms: ["wholesale camping equipment", "camping gear bulk", "camping equipment supplier"] },
                { id: "5", term: "custom branded camping gear", volume: "480", difficulty: "easy", cpc: "$2.10", intent: "transactional", competition: "low", trend: "up", relevance: 85, relatedTerms: ["custom camping gear wholesale", "branded outdoor equipment", "OEM camping gear"] },
                { id: "6", term: "eco friendly camping products wholesale", volume: "650", difficulty: "medium", cpc: "$2.80", intent: "commercial", competition: "low", trend: "up", relevance: 87, relatedTerms: ["sustainable camping gear wholesale", "eco camping equipment", "green outdoor gear bulk"] },
                { id: "7", term: "family camping package wholesale", volume: "380", difficulty: "easy", cpc: "$1.90", intent: "transactional", competition: "low", trend: "up", relevance: 82, relatedTerms: ["camping bundle wholesale", "family tent package", "complete camping kit bulk"] },
                { id: "8", term: "lightweight camping gear wholesale", volume: "920", difficulty: "medium", cpc: "$2.40", intent: "commercial", competition: "medium", trend: "up", relevance: 89, relatedTerms: ["ultralight camping equipment", "lightweight tent wholesale", "portable camping gear"] },
              ],
              generatedAt: new Date().toISOString(),
            },
            actions: [
              { label: "导出关键词", id: "export-keywords", variant: "secondary" },
              { label: "生成内容", id: "generate-content-keywords", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSEOSiteConnection = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "seo",
          content: "🔗 管理您的独立站连接：",
          card: {
            type: "site-connection",
            data: {
              sites: [
                {
                  id: "1",
                  platform: "wordpress",
                  name: "Camping Gear Wholesale",
                  url: "https://campinggearwholesale.com",
                  status: "connected",
                  lastSync: "2026-03-27T10:30:00Z",
                  autoPublish: true,
                },
              ],
            },
            actions: [
              { label: "添加站点", id: "add-site", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleEmailCustomers = () => {
    setTimeout(() => {
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
      setIsTyping(false);
    }, 1200);
  };

  const handleEmailPreview = () => {
    setTimeout(() => {
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
      setIsTyping(false);
    }, 1200);
  };

  const handleEmailSend = () => {
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
        a.agent === "email" ? { ...a, status: "working" as const, task: "邮件发送中", progress: 15 } : a
      )
    );
    setIsTyping(false);
  };

  const handleHelp = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "我可以帮您完成以下任务：\n\n📋 **获客任务**\n• 「帮我找美国户外用品批发商」创建获客任务\n• 「任务进展如何」查看实时状态\n• 「查看线索」查看已获得的线索\n• 「本周效果如何」查看数据看板\n\n🔍 **SEO Agent**\n• 「@SEO Agent 关键词」查看关键词策略\n• 「@SEO Agent 生成文章」生成SEO文章\n• 「@SEO Agent 编辑文章」编辑SEO文章\n• 「@SEO Agent 绑定站点」连接WordPress/Shopify\n• 「@SEO Agent 文章数据」查看文章效果\n• 「@SEO Agent 竞品分析」分析竞争对手\n• 「@SEO Agent 生成站点」一键建站\n• 「@SEO Agent 健康检查」SEO健康监控\n• 「@SEO Agent 推荐关键词」获取关键词推荐\n\n✉️ **Email Agent**\n• 「@Email Agent 客户」筛选目标客户\n• 「@Email Agent 预览邮件」预览开发信\n\n有什么可以帮您的吗？",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleDefaultResponse = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: "收到您的消息。您可以尝试以下指令：\n• 「任务进展如何」查看实时状态\n• 「查看线索」查看已获得的线索\n• 「本周效果如何」查看数据看板\n• 「@SEO Agent 生成文章」生成SEO文章\n• 「@SEO Agent 编辑文章」编辑文章\n• 「@SEO Agent 绑定站点」连接独立站\n• 「@SEO Agent 文章数据」查看效果数据\n• 「@SEO Agent 竞品分析」分析竞品\n• 「@SEO Agent 生成站点」一键建站\n• 「@SEO Agent 健康检查」SEO监控\n• 「@Email Agent 查看客户」操作邮件任务\n\n或者输入「帮助」查看所有可用指令。",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  // Handle file upload with parsing simulation
  const handleFileUpload = useCallback((files: { name: string; size: string; type: string }[]) => {
    setIsTyping(true);
    
    // First message: acknowledge upload
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: `上传了文件: ${files.map(f => `[${f.name}]`).join(" ")}`,
        timestamp: new Date(),
      },
    ]);
    
    // Simulate parsing delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          agent: "supervisor",
          content: `已接收文件，正在解析文档内容...\n\n📄 ${files.map(f => f.name).join(', ')}`,
          timestamp: new Date(),
        },
      ]);
    }, 500);
    
    // Simulate parsing result
    setTimeout(() => {
      const parsedProfile: CompanyProfile = {
        category: "户外用品（帐篷/睡袋/登山装备）",
        advantage: "自有工厂、OEM定制、通过ISO认证",
        market: "北美、欧洲",
        targetCustomer: "批发商、品牌商",
        priceRange: "中高端",
      };
      
      setCompanyProfile(parsedProfile);
      
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now() + 1}`,
          role: "agent",
          agent: "supervisor",
          content: "✅ 文档解析完成！基于您上传的产品目录，我提取了以下信息：",
          card: {
            type: "company-profile",
            data: parsedProfile,
            actions: [
              { label: "编辑修改", id: "edit-profile", variant: "secondary" },
              { label: "✓ 确认无误", id: "confirm-profile", variant: "primary" },
            ],
          },
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 2500);
  }, []);

  // Handle card actions with full editing support
  const handleCardAction = useCallback(
    (actionId: string, cardData?: Record<string, any>) => {
      switch (actionId) {
        // Edit actions
        case "edit-profile": {
          const currentProfile = companyProfile || {
            category: "户外用品（帐篷/睡袋/登山装备）",
            advantage: "自有工厂、OEM定制、通过ISO认证",
            market: "北美、欧洲",
            targetCustomer: "批发商、品牌商",
            priceRange: "中高端",
          };
          setEditingCard({ type: "company-profile", data: currentProfile });
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: "请编辑企业画像信息：",
              card: {
                type: "company-profile-edit",
                data: currentProfile,
                actions: [
                  { label: "取消", id: "cancel-edit", variant: "secondary" },
                  { label: "保存", id: "save-profile", variant: "primary" },
                ],
              },
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "edit-persona": {
          const currentPersona = customerPersona || {
            region: "美国",
            industry: "户外用品批发",
            scale: "中型（50-200人）",
            purchaseVolume: "100万-500万美元/年",
            decisionMaker: "采购经理/采购总监",
            timeline: "3个月内",
          };
          setEditingCard({ type: "customer-persona", data: currentPersona });
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: "请编辑客户画像信息：",
              card: {
                type: "customer-persona-edit",
                data: currentPersona,
                actions: [
                  { label: "取消", id: "cancel-edit", variant: "secondary" },
                  { label: "保存", id: "save-persona", variant: "primary" },
                ],
              },
              timestamp: new Date(),
            },
          ]);
          break;
        }

        // Save actions
        case "save-profile": {
          if (editingCard && cardData) {
            setCompanyProfile(cardData as CompanyProfile);
            setEditingCard(null);
            setMessages((prev) => [
              ...prev,
              {
                id: `agent-${Date.now()}`,
                role: "agent",
                agent: "supervisor",
                content: "✅ 企业画像已更新！",
                card: {
                  type: "company-profile",
                  data: cardData,
                  actions: [
                    { label: "编辑修改", id: "edit-profile", variant: "secondary" },
                    { label: "✓ 确认无误", id: "confirm-profile", variant: "primary" },
                  ],
                },
                timestamp: new Date(),
              },
            ]);
          }
          break;
        }

        case "save-persona": {
          if (editingCard && cardData) {
            setCustomerPersona(cardData as CustomerPersona);
            setEditingCard(null);
            setMessages((prev) => [
              ...prev,
              {
                id: `agent-${Date.now()}`,
                role: "agent",
                agent: "supervisor",
                content: "✅ 客户画像已更新！",
                card: {
                  type: "customer-persona",
                  data: cardData,
                  actions: [
                    { label: "编辑", id: "edit-persona", variant: "secondary" },
                    { label: "✓ 确认无误", id: "confirm-persona", variant: "primary" },
                  ],
                },
                timestamp: new Date(),
              },
            ]);
          }
          break;
        }

        case "cancel-edit": {
          setEditingCard(null);
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: "已取消编辑。",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        // Confirmation actions
        case "confirm-profile":
          handleConfirmProfile();
          break;

        case "confirm-persona":
          handleConfirmPersona();
          break;

        case "confirm-plan":
          handleConfirmPlan();
          break;

        // SEO actions
        case "view-article":
          handleSEOArticle();
          break;

        case "edit-article":
          handleSEOEdit();
          break;

        case "save-article": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: "✅ 文章已保存！\n\n您的修改已保存到草稿。您可以随时继续编辑或发布。",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "publish-article":
          handleSEOPublish();
          break;

        case "site-connected":
        case "site-updated":
        case "site-disconnected":
        case "test-connection": {
          const actionMsg = actionId === "site-connected" ? "✅ 站点连接成功！" :
                           actionId === "site-updated" ? "✅ 站点设置已更新！" :
                           actionId === "site-disconnected" ? "✅ 站点已断开连接！" :
                           "🔄 正在测试连接...";
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: actionMsg,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "view-detailed-analytics":
        case "optimize-article":
        case "share-report": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: `正在处理您的请求：${actionId}...`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "export-competitor-report":
        case "generate-strategy":
        case "refresh-analysis": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: actionId === "generate-strategy" ? 
                "🎯 基于竞品分析，为您生成以下应对策略：\n\n1. 重点布局关键词：eco-friendly camping gear wholesale、family camping package wholesale\n2. 内容策略：创建产品对比文章，突出您的优势\n3. 技术优化：改善移动端体验，预计可超越竞品\n4. 链接建设：针对competitor的弱链接进行定向外链建设" :
                `✅ 操作完成：${actionId}`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "deploy-site":
        case "download-source": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: actionId === "deploy-site" ?
                "🚀 站点正在部署中...\n\n• 域名解析配置中\n• SSL证书申请中\n• CDN加速配置中\n\n预计5-10分钟后完成，完成后我会通知您！" :
                "📦 源码已打包下载！\n\n包含：\n• 完整的HTML/CSS/JS源码\n• SEO优化配置文件\n• 部署说明文档",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "view-detailed-health":
        case "fix-all-issues": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: actionId === "fix-all-issues" ?
                "🔧 正在自动修复SEO问题...\n\n✅ 已修复：为3个页面添加Meta描述\n✅ 已修复：缩短过长的标题标签\n✅ 已优化：启用图片懒加载\n✅ 已优化：添加浏览器缓存配置\n\n整体SEO评分已提升至 89分！" :
                "📊 正在生成详细报告...",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "scan-complete": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: "✅ 扫描完成！已更新SEO健康状态。",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "add-to-strategy":
        case "generate-content": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: actionId === "add-to-strategy" ?
                "✅ 关键词已添加到您的SEO策略！\n\n我会根据这些关键词为您规划后续的内容创作。" :
                "📝 正在为选中的关键词生成内容大纲...",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "export-keywords": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: "📥 关键词列表已导出！",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "view-all-keywords":
        case "view-all-sites": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "seo",
              content: "📋 正在加载完整列表...",
              timestamp: new Date(),
            },
          ]);
          break;
        }

        // Email actions
        case "preview-email":
          handleEmailPreview();
          break;

        case "start-sending":
          handleEmailSend();
          break;

        // Lead actions
        case "view-all-leads": {
          const highIntentLeads = leads.filter(l => l.score >= 80);
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "lead",
              content: `📋 线索收件箱 - 共 ${leads.length} 条线索\n\n🔥 高意向线索（评分80+）：${highIntentLeads.length} 条\n📧 Email渠道：${leads.filter(l => l.source === "email").length} 条\n🔍 SEO渠道：${leads.filter(l => l.source === "seo").length} 条\n\n点击线索卡片中的"查看详情"可以查看更多信息并生成回复。`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "view-lead-detail": {
          const leadId = cardData?.leadId;
          const lead = leads.find(l => l.id === leadId);
          if (lead) {
            setMessages((prev) => [
              ...prev,
              {
                id: `agent-${Date.now()}`,
                role: "agent",
                agent: "lead",
                content: `查看线索详情：${lead.company}`,
                card: {
                  type: "lead-detail",
                  data: { lead, notes: "" },
                },
                timestamp: new Date(),
              },
            ]);
          }
          break;
        }

        case "back-to-leads": {
          // 返回线索列表
          handleQueryLeads();
          break;
        }

        case "generate-reply": {
          const lead = cardData?.lead as Lead;
          if (lead) {
            // 生成回复建议
            const suggestion = generateReplySuggestion(lead);
            setMessages((prev) => [
              ...prev,
              {
                id: `agent-${Date.now()}`,
                role: "agent",
                agent: "lead",
                content: `已为 ${lead.company} 生成回复建议：`,
                card: {
                  type: "reply-suggestion",
                  data: { lead, suggestion },
                },
                timestamp: new Date(),
              },
            ]);
          }
          break;
        }

        case "send-reply": {
          const { lead, subject, content } = cardData || {};
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "email",
              content: `✅ 邮件已发送给 ${lead?.company}！\n\n主题：${subject}\n\n我会持续跟进对方的回复情况。`,
              timestamp: new Date(),
            },
          ]);
          // 更新线索状态
          setLeads(prev => prev.map(l => 
            l.id === lead?.id 
              ? { ...l, status: "contacted" as const, lastContact: "刚刚" }
              : l
          ));
          break;
        }

        case "regenerate-content": {
          const lead = cardData?.lead as Lead;
          if (lead) {
            const suggestion = generateReplySuggestion(lead, true);
            setMessages((prev) => [
              ...prev,
              {
                id: `agent-${Date.now()}`,
                role: "agent",
                agent: "lead",
                content: `已重新生成回复建议：`,
                card: {
                  type: "reply-suggestion",
                  data: { lead, suggestion },
                },
                timestamp: new Date(),
              },
            ]);
          }
          break;
        }

        case "save-draft": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: `✅ 草稿已保存！`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "schedule-followup": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: `已设置跟进提醒！我会在24小时后提醒您跟进此线索。`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "assign-lead": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: `功能开发中：团队线索分配功能即将上线，届时您可以将线索分配给团队成员协作跟进。`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "save-notes": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: `✅ 备注已保存！`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case "add-tag": {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              agent: "supervisor",
              content: `功能开发中：标签管理功能即将上线。`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        // Default
        default:
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
    [editingCard, companyProfile, customerPersona, leads]
  );

  // Helper function to generate reply suggestions
  const generateReplySuggestion = (lead: Lead, isRegenerate = false): {
    subject: string;
    content: string;
    highlights: string[];
    tips: string;
  } => {
    const hasInteraction = lead.interactions && lead.interactions.length > 0;
    const lastInteraction = hasInteraction ? lead.interactions![lead.interactions!.length - 1] : null;
    
    // 根据线索特征生成个性化主题行
    const subjects = [
      `Re: ${lead.company} - 户外装备合作机会`,
      `${lead.company} 的露营装备定制方案`,
      `关于 ${lead.company} 的批发询价回复`,
    ];
    
    const subject = isRegenerate 
      ? `Re: 跟进 - ${lead.company} 户外装备供应`
      : subjects[Math.floor(Math.random() * subjects.length)];

    // 根据互动历史生成个性化内容
    let greeting = lead.contactName ? `Hi ${lead.contactName.split(' ')[0]},` : `Hi there,`;
    
    let content = `${greeting}

Thanks for your interest in our outdoor gear products.

Based on ${lead.company}'s profile as a ${lead.industry} in ${lead.location}, I believe we can be a great supplier partner for you.

Here's what we can offer:
• Premium camping tents with custom branding (MOQ: 100 units)
• Competitive wholesale pricing (20-30% below market average)
• Fast production turnaround (30 days)
• Full quality inspection & warranty

Would you be interested in receiving our catalog with pricing? I'd be happy to schedule a call to discuss your specific requirements.

Best regards,
Sarah Chen
Export Manager

P.S. We're currently offering 5% off first orders for new wholesale partners.`;

    // 如果有互动历史，个性化内容
    if (lastInteraction) {
      if (lastInteraction.type === "email_opened") {
        content = content.replace(
          "Thanks for your interest",
          "I noticed you opened my previous email - thanks for your interest"
        );
      } else if (lastInteraction.type === "site_visit") {
        content = content.replace(
          "Thanks for your interest",
          "I saw you visited our product catalog - thanks for your interest"
        );
      }
    }

    const highlights = [
      `针对${lead.industry}的个性化内容`,
      "提及具体产品优势和MOQ",
      "包含明确的行动召唤（CTA）",
      lead.score >= 80 ? "高意向线索专用跟进话术" : "标准培育话术",
    ];

    const tips = lead.score >= 80
      ? "高意向线索！建议在24小时内发送，并准备详细产品资料以备回复。"
      : "建议发送后3天内观察是否打开邮件，再决定是否二次跟进。";

    return { subject, content, highlights, tips };
  };

  return {
    messages,
    isTyping,
    sendMessage,
    handleCardAction,
    handleFileUpload,
    activeTask,
    setActiveTask,
    agentStatuses,
    leads,
    companyProfile,
    customerPersona,
    editingCard,
  };
}
