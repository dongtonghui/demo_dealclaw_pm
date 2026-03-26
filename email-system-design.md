# DealClaw 获客师 - 邮件系统归属与反垃圾邮件完整方案

## 文档信息

| 字段 | 内容 |
|-----|------|
| 文档名称 | 邮件系统归属与反垃圾邮件方案 |
| 版本 | V1.0 |
| 编写日期 | 2026-03-26 |
| 适用范围 | DealClaw 获客师邮件外联模块 |

---

## 1. 方案概述

### 1.1 核心目标

- **高送达率**：确保Cold Email送达率>95%，收件箱率>85%
- **品牌一致性**：支持客户自有品牌域名发送
- **合规安全**：符合CAN-SPAM、GDPR等国际法规
- **智能优化**：基于数据自动优化发送策略

### 1.2 技术架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                      DealClaw 邮件系统架构                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  发件人管理  │  │  域名配置   │  │  模板管理   │             │
│  │  邮箱归属   │  │  SPF/DKIM  │  │  AI生成     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         └─────────────────┼─────────────────┘                   │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                  智能发送引擎                          │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │     │
│  │  │ Warm-up  │ │ 频率控制 │ │ 队列调度 │ │ 信誉监控 │ │     │
│  │  │ 预热系统 │ │ 智能限流 │ │ 时区优化 │ │ 评分系统 │ │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │     │
│  └─────────────────────────┬─────────────────────────────┘     │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                  发送渠道层                            │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │     │
│  │  │ SendGrid │ │  AWS SES │ │ 自有SMTP │              │     │
│  │  │ 主力通道 │ │ 备用通道 │ │ 高级客户 │              │     │
│  │  └──────────┘ └──────────┘ └──────────┘              │     │
│  └─────────────────────────┬─────────────────────────────┘     │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                  数据监控层                            │     │
│  │  送达追踪 │ 打开追踪 │ 点击追踪 │ 退信监控 │ 投诉监控  │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 邮箱归属策略

### 2.1 方案对比分析

| 维度 | 方案A：DealClaw统一域名 | 方案B：客户自有域名 | 方案C：子域名委托 |
|-----|------------------------|-------------------|------------------|
| **域名格式** | @mail.dealclaw.com | @customer.com | @outreach.customer.com |
| **发件人显示** | "张三 via DealClaw" | "张三" | "张三" |
| **品牌一致性** | 弱 | 强 | 较强 |
| **专业信任度** | 较低 | 高 | 较高 |
| **设置复杂度** | 极低 | 较复杂 | 中等 |
| **技术门槛** | 无 | 需配置DNS | 需配置DNS |
| **风险隔离** | 差 | 好 | 较好 |
| **成本** | 低 | 中 | 中 |
| **适用客户** | 小微企业试用 | 中大型企业 | 所有正式客户 |

### 2.2 各方案详细分析

#### 方案A：DealClaw统一域名邮箱

**适用场景**：
- 客户无自有域名（部分小微企业）
- 试用/体验阶段
- 快速启动，零配置

**域名结构**：
```
发件地址格式: {company-slug}-{sender}@mail.dealclaw.com
示例: acme-corp-sales@mail.dealclaw.com
```

**优点**：
- 开箱即用，无需任何配置
- 由DealClaw统一维护域名信誉
- 成本最低

**缺点**：
- 品牌一致性差，影响专业形象
- 客户域名信誉积累为零
- 一个客户违规影响全局

**实施建议**：
- 仅用于免费试用账户（发送量<100封/月）
- 邮件末尾强制添加"Sent via DealClaw"标识
- 限制单日发送量不超过50封

#### 方案B：客户自有域名邮箱

**适用场景**：
- 有独立品牌意识的中大型企业
- 已有域名邮箱系统的客户
- 对品牌一致性要求极高

**配置要求**：
```
发件地址格式: {sender}@{customer-domain.com}
示例: sales@acme-corp.com
```

**优点**：
- 品牌一致性最佳
- 发件人信誉完全独立
- 专业形象最佳
- 邮件退回客户自有域名

**缺点**：
- 需配置SPF/DKIM/DMARC记录
- 需要客户IT部门配合
- 配置错误风险

**实施建议**：
- 提供详细的DNS配置向导
- 提供配置验证工具
- 建议配置专门的营销子域名

#### 方案C：子域名委托方案（推荐）

**适用场景**：
- 所有正式付费客户
- 平衡品牌与管理的最佳选择

**域名结构**：
```
主域名: customer.com
子域名: mail.customer.com / outreach.customer.com
发件地址: {sender}@mail.customer.com
```

**优点**：
- 品牌一致性良好
- 子域名信誉独立，风险隔离
- 不影响主域名正常邮件
- 配置相对简单
- 可灵活分配子域名用途

**实施建议**：
- 作为默认推荐方案
- 提供子域名命名建议
- 自动化DNS配置检测

### 2.3 推荐方案矩阵

| 客户类型 | 推荐方案 | 域名格式 | 发送限制 |
|---------|---------|---------|---------|
| 免费试用 | 方案A | @mail.dealclaw.com | 50封/天 |
| 基础版($29/mo) | 方案C | @mail.customer.com | 500封/天 |
| 专业版($99/mo) | 方案C | @outreach.customer.com | 2000封/天 |
| 企业版($299/mo) | 方案B/C可选 | 自定义 | 无限制 |

---

## 3. 发送域名配置方案

### 3.1 DNS记录配置详解

#### SPF记录配置

**作用**：声明允许哪些服务器代表域名发送邮件

**配置示例**：
```dns
# 类型: TXT
# 主机: mail (或 @ 如果使用根域名)
# 值:
v=spf1 include:sendgrid.net include:amazonses.com include:spf.dealclaw.com ~all
```

**各参数说明**：
| 参数 | 含义 | 说明 |
|-----|------|------|
| `v=spf1` | 版本 | SPF记录版本 |
| `include:sendgrid.net` | 包含SendGrid | 允许SendGrid服务器发送 |
| `include:amazonses.com` | 包含AWS SES | 允许AWS SES发送 |
| `include:spf.dealclaw.com` | 包含DealClaw | 允许DealClaw基础设施 |
| `~all` | 软拒绝 | 非授权邮件标记但不拒绝 |
| `-all` | 硬拒绝 | 非授权邮件直接拒绝 |

**重要提示**：
- 如果域名已有SPF记录，需合并而非覆盖
- 使用`~all`而非`-all`避免误伤
- SPF查询次数限制为10次

#### DKIM记录配置

**作用**：数字签名验证邮件真实性，防止篡改

**DealClaw托管模式配置**：
```dns
# SendGrid DKIM
# 类型: TXT
# 主机: s1._domainkey.mail
# 值:
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1TaNgLlSyQMNWVLNLvyY/neDgaL2oqQE8T5illKqCgDtFHc8eHVAU+nlcaGmrKmDMw9dbgiGk1ocgZ56NR4ycfUHwQhvQPMUZw0cveel/8EAGoi/UyPmqfcPibytH81NFtTMAxUeM4Op8A6iHkvAMj5qLf4YRNsTkKAKW3OkwPQIDAQAB

# 类型: TXT
# 主机: s2._domainkey.mail
# 值:
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1TaNgLlSyQMNWVLNLvyY/neDgaL2oqQE8T5illKqCgDtFHc8eHVAU+nlcaGmrKmDMw9dbgiGk1ocgZ56NR4ycfUHwQhvQPMUZw0cveel/8EAGoi/UyPmqfcPibytH81NFtTMAxUeM4Op8A6iHkvAMj5qLf4YRNsTkKAKW3OkwPQIDAQAB
```

#### DMARC记录配置

**作用**：定义SPF/DKIM验证失败时的处理策略

**推荐配置（渐进式）**：

**阶段1：监控模式（前30天）**
```dns
# 类型: TXT
# 主机: _dmarc.mail
# 值:
v=DMARC1; p=none; rua=mailto:dmarc@dealclaw.com; ruf=mailto:dmarc-forensic@dealclaw.com; fo=1
```

**阶段2：隔离模式（稳定后）**
```dns
# 类型: TXT
# 主机: _dmarc.mail
# 值:
v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@dealclaw.com
```

**阶段3：拒绝模式（完全信任后）**
```dns
# 类型: TXT
# 主机: _dmarc.mail
# 值:
v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@dealclaw.com
```

**DMARC参数说明**：
| 参数 | 含义 | 推荐值 |
|-----|------|--------|
| `p=none` | 监控模式，不处理失败 | 初期使用 |
| `p=quarantine` | 隔离模式，放入垃圾箱 | 中期过渡 |
| `p=reject` | 拒绝模式，直接拒收 | 成熟后使用 |
| `pct=10` | 应用比例10% | 逐步提升 |
| `rua=` | 聚合报告接收地址 | DealClaw监控邮箱 |

#### MX记录配置（可选）

如需接收回复邮件：
```dns
# 类型: MX
# 主机: mail
# 优先级: 10
# 值: mx.dealclaw.com
```

### 3.2 完整DNS配置清单

以子域名 `mail.customer.com` 为例：

| 记录类型 | 主机记录 | 记录值 | 优先级 | TTL |
|---------|---------|--------|--------|-----|
| A | mail | 192.0.2.1 | - | 3600 |
| TXT | mail | v=spf1 include:sendgrid.net include:spf.dealclaw.com ~all | - | 3600 |
| TXT | s1._domainkey.mail | v=DKIM1; k=rsa; p=... | - | 3600 |
| TXT | s2._domainkey.mail | v=DKIM1; k=rsa; p=... | - | 3600 |
| TXT | _dmarc.mail | v=DMARC1; p=none; rua=mailto:dmarc@dealclaw.com | - | 3600 |
| MX | mail | mx.dealclaw.com | 10 | 3600 |
| CNAME | mail | mail.dealclaw.com | - | 3600 |

### 3.3 配置验证工具

#### 自动化验证API

DealClaw应提供以下验证端点：

```typescript
// DNS配置验证接口
interface DNSValidationRequest {
  domain: string;           // 例如: "mail.acme.com"
  expectedRecords: {
    spf?: string;
    dkim?: string[];
    dmarc?: string;
  };
}

interface DNSValidationResult {
  domain: string;
  overallStatus: 'valid' | 'partial' | 'invalid';
  checks: {
    spf: {
      status: 'valid' | 'invalid' | 'missing';
      record: string | null;
      issues: string[];
    };
    dkim: {
      status: 'valid' | 'invalid' | 'missing';
      selectors: Array<{
        name: string;
        status: 'valid' | 'invalid';
        record: string;
      }>;
    };
    dmarc: {
      status: 'valid' | 'invalid' | 'missing';
      record: string | null;
      policy: string;
    };
  };
  recommendations: string[];
}
```

#### 手动验证命令

```bash
# SPF验证
dig TXT mail.customer.com | grep "v=spf1"

# DKIM验证
dig TXT s1._domainkey.mail.customer.com
dig TXT s2._domainkey.mail.customer.com

# DMARC验证
dig TXT _dmarc.mail.customer.com

# 使用在线工具验证
# - https://mxtoolbox.com/spf.aspx
# - https://mxtoolbox.com/dkim.aspx
# - https://mxtoolbox.com/dmarc.aspx
```

### 3.4 常见配置问题及解决

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| SPF记录过长 | 超过255字符限制 | 拆分多条TXT记录或使用include |
| DKIM验证失败 | 公钥格式错误 | 确保p=值无空格和换行 |
| DMARC报告未收到 | rua地址错误 | 确认邮箱可接收外部邮件 |
| 多个SPF记录 | 重复定义 | 合并为一条记录 |
| 子域名继承问题 | 父域DMARC策略 | 显式定义子域DMARC |


---

## 4. 反垃圾邮件体系

### 4.1 邮件发送信誉建立（Warm-up策略）

#### Warm-up阶段定义

```
┌────────────────────────────────────────────────────────────────┐
│                     邮箱信誉建立曲线                            │
├────────────────────────────────────────────────────────────────┤
│  发送量                                                          │
│    ▲                                                            │
│    │                                          ╭───────── 正常发送 │
│    │                                     ╭────╯                │
│    │                                ╭────╯                     │
│    │                           ╭────╯                          │
│    │                      ╭────╯                               │
│    │                 ╭────╯                                    │
│    │            ╭────╯                                         │
│    │       ╭────╯                                              │
│    │  ╭────╯                                                   │
│    │──╯                                                        │
│    └─────────────────────────────────────────────────────────▶ │
│      W1  W2  W3  W4  W5  W6  W7  W8  W9  W10  W11+              │
│                                                                 │
│    W1-W2: 预热期 (20-50封/天)                                   │
│    W3-W6: 提升期 (50-500封/天)                                  │
│    W7-W10: 稳定期 (500-2000封/天)                               │
│    W11+: 正常期 (根据域名信誉动态调整)                           │
└────────────────────────────────────────────────────────────────┘
```

#### 详细Warm-up计划

**阶段1：预热期（第1-2周）**

| 天数 | 日发送量 | 发送间隔 | 目标邮箱类型 | 监控重点 |
|-----|---------|---------|-------------|---------|
| 1-3 | 20封/天 | 5-10分钟 | 高互动种子邮箱 | 退信率<5% |
| 4-7 | 30封/天 | 4-8分钟 | 高质量目标邮箱 | 打开率>30% |
| 8-10 | 40封/天 | 3-6分钟 | 扩大目标范围 | 垃圾邮件投诉<0.1% |
| 11-14 | 50封/天 | 2-5分钟 | 正常目标邮箱 | 域名信誉评分>70 |

**阶段2：提升期（第3-6周）**

| 周次 | 日发送量上限 | 发送策略 | 监控阈值 |
|-----|-------------|---------|---------|
| W3 | 100封/天 | 分时段发送 | 退信率<3% |
| W4 | 200封/天 | 引入A/B测试 | 打开率>25% |
| W5 | 350封/天 | 多渠道轮换 | 投诉率<0.05% |
| W6 | 500封/天 | 全量发送准备 | 信誉评分>80 |

**阶段3：稳定期（第7-10周）**

| 周次 | 日发送量上限 | 优化策略 |
|-----|-------------|---------|
| W7-W8 | 1000封/天 | 发送时间优化 |
| W9-W10 | 2000封/天 | 个性化内容优化 |

**阶段4：正常期（第11周+）**

基于域名信誉动态调整：
- 信誉评分>90：无限制（合理范围内）
- 信誉评分80-90：5000封/天
- 信誉评分70-80：2000封/天
- 信誉评分60-70：500封/天，进入观察期
- 信誉评分<60：暂停发送，启动修复流程

#### Warm-up执行规则

```typescript
interface WarmUpConfig {
  domain: string;
  currentPhase: 'warmup' | 'rampup' | 'stable' | 'normal';
  dailyLimit: number;
  sendInterval: {
    min: number;  // 最小间隔（秒）
    max: number;  // 最大间隔（秒）
  };
  targetMailboxes: 'seed' | 'quality' | 'normal' | 'all';
  monitoringThresholds: {
    bounceRate: number;      // 退信率阈值
    spamComplaintRate: number; // 投诉率阈值
    openRate: number;        // 打开率目标
  };
}

// Warm-up阶段自动推进条件
const warmupProgressionRules = {
  warmup: {
    minDays: 14,
    maxBounceRate: 0.05,
    minOpenRate: 0.25,
    nextPhase: 'rampup'
  },
  rampup: {
    minDays: 28,
    maxBounceRate: 0.03,
    minOpenRate: 0.20,
    nextPhase: 'stable'
  },
  stable: {
    minDays: 42,
    reputationScore: 80,
    nextPhase: 'normal'
  }
};
```

### 4.2 内容垃圾评分检测

#### 垃圾邮件关键词库

**高风险词汇（避免使用）**：
```javascript
const highRiskKeywords = [
  // 金融相关
  'free money', 'make money', 'earn cash', 'extra income',
  'double your', 'million dollars', 'no investment',
  
  // 紧迫性诱导
  'act now', 'urgent', 'limited time', 'expires today',
  'call now', 'order now', 'buy now',
  
  // 夸大承诺
  'guarantee', 'risk free', 'no obligation', '100% free',
  'winner', 'congratulations', 'selected',
  
  // 敏感内容
  'weight loss', 'work from home', 'earn per week',
  'credit card', 'no credit check', 'cash bonus'
];

// 外贸场景特别注意
const外贸HighRiskKeywords = [
  'cheapest price', 'lowest price', 'factory direct',
  'massive discount', 'hot selling', 'limited stock'
];
```

**中等风险词汇（谨慎使用）**：
```javascript
const mediumRiskKeywords = [
  'promotion', 'discount', 'sale', 'offer',
  'click here', 'click below', 'order here',
  'amazing', 'incredible', 'fantastic'
];
```

#### AI内容评分系统

```typescript
interface SpamScoreResult {
  overallScore: number;  // 0-100, 越低越好
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
  breakdown: {
    contentScore: number;      // 内容质量
    formattingScore: number;   // 格式合规
    technicalScore: number;    // 技术合规
    reputationScore: number;   // 发件人信誉
  };
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    suggestion: string;
  }>;
  recommendations: string[];
}

// 评分权重
const spamScoreWeights = {
  subjectLine: 0.25,      // 主题行权重
  bodyContent: 0.30,      // 正文内容权重
  htmlRatio: 0.15,        // HTML/Text比例权重
  linkDensity: 0.15,      // 链接密度权重
  imageRatio: 0.15        // 图片比例权重
};
```

#### 内容优化建议

**主题行优化**：
```
❌ 差：URGENT: LIMITED TIME OFFER - 50% OFF ALL PRODUCTS!!!
✅ 好：Quick question about your {Product Category} sourcing

❌ 差：MAKE MONEY FAST - Work With Our Factory Direct!!!
✅ 好：Partnership opportunity: {Their Company} × {Your Company}
```

**正文结构优化**：
```
推荐结构：
1. 个性化开场（提及对方公司/产品）
2. 简短的自我介绍（1-2句）
3. 价值主张（如何解决对方痛点）
4. 明确的CTA（单一、具体）
5. 专业的签名

字数控制：
- 总字数：100-200词（英文）
- 段落数：3-5段
- 链接数：1-2个
- 图片数：0-1张（可选）
```

### 4.3 发送行为优化

#### 发送频率控制

**基于域名信誉的动态频率**：

```typescript
interface SendRateLimit {
  reputationTier: 'excellent' | 'good' | 'fair' | 'poor';
  dailyLimit: number;
  hourlyLimit: number;
  burstLimit: number;      // 突发限制
  minInterval: number;     // 最小发送间隔（秒）
}

const rateLimits: Record<string, SendRateLimit> = {
  excellent: {
    dailyLimit: 10000,
    hourlyLimit: 1000,
    burstLimit: 100,
    minInterval: 3
  },
  good: {
    dailyLimit: 5000,
    hourlyLimit: 500,
    burstLimit: 50,
    minInterval: 5
  },
  fair: {
    dailyLimit: 1000,
    hourlyLimit: 150,
    burstLimit: 20,
    minInterval: 10
  },
  poor: {
    dailyLimit: 100,
    hourlyLimit: 20,
    burstLimit: 5,
    minInterval: 30
  }
};
```

#### 发送时间优化

**目标时区智能调度**：

```typescript
interface TimeZoneOptimization {
  // 目标地区最佳发送时间（当地时间）
  optimalSendTimes: Record<string, { start: number; end: number }> = {
    'North America': { start: 9, end: 11 },   // 9-11 AM
    'Europe': { start: 10, end: 12 },         // 10-12 PM
    'Asia': { start: 9, end: 11 },            // 9-11 AM
    'Middle East': { start: 10, end: 14 },    // 10 AM-2 PM
    'Oceania': { start: 9, end: 11 },         // 9-11 AM
    'South America': { start: 10, end: 12 }   // 10 AM-12 PM
  };
  
  // 避开的时间
  avoidTimes: {
    earlyMorning: { start: 0, end: 7 },       // 0-7 AM
    lateEvening: { start: 20, end: 23 },      // 8-11 PM
    weekends: boolean;                        // 是否避开周末
  };
}

// 智能调度算法
function calculateOptimalSendTime(
  recipientTimezone: string,
  recipientDomain: string,
  historicalData: EngagementData
): Date {
  // 1. 确定目标时区最佳时间窗口
  // 2. 考虑历史打开数据
  // 3. 避开高退信时段
  // 4. 分散发送避免突发
}
```

**最佳发送时间参考**：

| 目标地区 | 最佳时间（当地时间） | 次佳时间 | 避开时间 |
|---------|-------------------|---------|---------|
| 美国东部 | 周二-周四 9-11 AM | 2-4 PM | 周一、周五全天 |
| 美国西部 | 周二-周四 9-11 AM | 2-4 PM | 周一、周五全天 |
| 英国 | 周二-周四 10-12 PM | 2-4 PM | 周一、周五全天 |
| 德国 | 周二-周四 10-12 PM | 2-3 PM | 周一、周五全天 |
| 法国 | 周二-周四 10-12 PM | 2-4 PM | 周一、周五全天 |
| 中东 | 周日-周三 10-14 PM | 15-17 PM | 周四、周五、周六 |
| 日本 | 周二-周四 9-11 AM | 14-16 PM | 周一、周五全天 |
| 澳大利亚 | 周二-周四 9-11 AM | 14-16 PM | 周一、周五全天 |

**注意**：中东地区周日为工作日，周五、周六为周末

#### 发送间隔抖动

避免机器发送特征：

```typescript
function getJitteredInterval(baseInterval: number): number {
  // 基础间隔 ±30% 随机抖动
  const jitter = 0.3;
  const min = baseInterval * (1 - jitter);
  const max = baseInterval * (1 + jitter);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 示例：基础间隔5秒
// 实际间隔在 3.5秒 - 6.5秒 之间随机
```


### 4.4 黑名单监控和自动暂停

#### 实时监控体系

```typescript
interface BlacklistMonitor {
  // 监控的黑名单
  blacklists: string[] = [
    'spamhaus.org',
    'surbl.org',
    'barracudacentral.org',
    'spamcop.net',
    'uceprotect.net',
    'invaluement.com',
    'dnsbl.sorbs.net'
  ];
  
  // 检查频率
  checkFrequency: {
    activeDomains: 'every_hour';      // 活跃域名每小时检查
    normalDomains: 'every_6_hours';   // 普通域名每6小时
    warmupDomains: 'every_30_min'     // 预热域名每30分钟
  };
}
```

#### 自动响应机制

```typescript
interface AutoResponseRule {
  trigger: {
    type: 'blacklist' | 'bounce_rate' | 'complaint_rate' | 'reputation_drop';
    threshold: number;
    duration: number;  // 持续多久触发
  };
  action: {
    type: 'pause' | 'throttle' | 'alert' | 'escalate';
    params: {
      pauseDuration?: number;      // 暂停时长（分钟）
      throttleRate?: number;       // 限制比例
      notifyChannels?: string[];   // 通知渠道
    };
  };
  recovery: {
    autoResume: boolean;
    resumeConditions: string[];
  };
}

// 自动响应规则配置
const autoResponseRules: AutoResponseRule[] = [
  {
    trigger: { type: 'blacklist', threshold: 1, duration: 0 },
    action: { 
      type: 'pause', 
      params: { pauseDuration: 1440, notifyChannels: ['email', 'slack'] }
    },
    recovery: { autoResume: false, resumeConditions: ['manual_review'] }
  },
  {
    trigger: { type: 'bounce_rate', threshold: 0.05, duration: 60 },
    action: { 
      type: 'throttle', 
      params: { throttleRate: 0.5, notifyChannels: ['email'] }
    },
    recovery: { autoResume: true, resumeConditions: ['bounce_rate<0.03'] }
  },
  {
    trigger: { type: 'complaint_rate', threshold: 0.001, duration: 30 },
    action: { 
      type: 'pause', 
      params: { pauseDuration: 480, notifyChannels: ['email', 'slack'] }
    },
    recovery: { autoResume: false, resumeConditions: ['manual_review'] }
  }
];
```

---

## 5. 送达率保障机制

### 5.1 退信率监控

#### 退信分类

| 退信类型 | 定义 | 处理方式 | 阈值 |
|---------|------|---------|------|
| **硬退信** | 邮箱不存在/域名无效 | 立即加入黑名单 | >2%告警 |
| **软退信-临时** | 邮箱已满/服务暂时不可用 | 重试3次后暂停 | >5%告警 |
| **软退信-永久** | 服务器拒绝/策略阻止 | 暂停该域名发送 | >3%告警 |
| **内容拒绝** | 内容被标记为垃圾邮件 | 检查内容质量 | >1%告警 |
| **IP拒绝** | 发送IP被拉黑 | 切换IP/通道 | 立即处理 |

#### 退信处理流程

```
┌────────────────────────────────────────────────────────────────┐
│                        退信处理流程                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  收到退信                                                         │
│     │                                                            │
│     ▼                                                            │
│  ┌─────────────┐                                                │
│  │ 解析退信类型 │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│    ┌────┼────┬────────┬──────────┐                              │
│    ▼    ▼    ▼        ▼          ▼                              │
│  硬退  软退  内容拒绝  IP拒绝    其他                             │
│    │    │      │        │         │                             │
│    ▼    ▼      ▼        ▼         ▼                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │立即拉黑│ │重试队列│ │内容审查│ │IP切换  │ │人工审核│        │
│  │        │ │3次暂停 │ │模板禁用│ │通道切换│ │        │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 投诉率监控

#### 投诉来源追踪

```typescript
interface ComplaintTracking {
  sources: {
    fbl: 'Feedback Loop';           // ISP反馈循环
    direct: 'Direct Complaint';      // 直接投诉到DealClaw
    unsubscribe: 'Unsubscribe';      // 退订（视为软投诉）
    spamButton: 'Spam Button Click'; // 用户点击垃圾邮件按钮
  };
  
  thresholds: {
    warning: 0.001;    // 0.1% - 警告
    critical: 0.003;   // 0.3% - 严重
    suspension: 0.005; // 0.5% - 暂停账户
  };
}
```

#### FBL（Feedback Loop）对接

支持的ISP FBL：
- Gmail (via Google Postmaster)
- Outlook/Hotmail (SNDS)
- Yahoo (Yahoo Complaint Feedback Loop)
- AOL
- Comcast
- RoadRunner
- 其他主要ISP

### 5.3 打开率/点击率追踪

#### 追踪机制

```typescript
interface EmailTracking {
  openTracking: {
    method: 'pixel';
    pixelUrl: 'https://track.dealclaw.com/o/{campaign_id}/{recipient_id}';
    uniqueness: 'first_open_only';  // 只记录首次打开
  };
  
  clickTracking: {
    method: 'url_rewrite';
    rewritePattern: 'https://track.dealclaw.com/c/{campaign_id}/{recipient_id}?u={original_url}';
    trackingDuration: 30;  // 链接追踪有效期（天）
  };
}
```

#### 行业基准对比

| 指标 | 优秀 | 良好 | 一般 | 需改进 | DealClaw目标 |
|-----|------|------|------|--------|-------------|
| 送达率 | >98% | 95-98% | 90-95% | <90% | >98% |
| 打开率 | >30% | 20-30% | 15-20% | <15% | >25% |
| 点击率 | >5% | 3-5% | 1-3% | <1% | >3% |
| 回复率 | >3% | 1-3% | 0.5-1% | <0.5% | >1% |
| 退信率 | <1% | 1-3% | 3-5% | >5% | <2% |
| 投诉率 | <0.1% | 0.1-0.3% | 0.3-0.5% | >0.5% | <0.1% |

### 5.4 自动优化建议

#### AI优化建议引擎

```typescript
interface AIOptimizationSuggestion {
  id: string;
  category: 'subject' | 'content' | 'timing' | 'audience' | 'technical';
  severity: 'high' | 'medium' | 'low';
  currentValue: any;
  suggestedValue: any;
  expectedImprovement: {
    metric: string;
    current: number;
    predicted: number;
  };
  reasoning: string;
  implementation: string;
}

// 优化建议示例
const exampleSuggestions: AIOptimizationSuggestion[] = [
  {
    id: 'opt-001',
    category: 'subject',
    severity: 'high',
    currentValue: 'Product Introduction - Best Price Guaranteed',
    suggestedValue: 'Quick question about {Company} supply chain',
    expectedImprovement: {
      metric: 'open_rate',
      current: 0.12,
      predicted: 0.28
    },
    reasoning: '当前主题包含Best Price等促销词汇，触发垃圾邮件过滤器。个性化问题式主题可提高打开率。',
    implementation: '使用AI主题行优化工具，添加个性化变量'
  },
  {
    id: 'opt-002',
    category: 'timing',
    severity: 'medium',
    currentValue: 'UTC 08:00统一发送',
    suggestedValue: '按收件人时区本地时间9:00-11:00发送',
    expectedImprovement: {
      metric: 'open_rate',
      current: 0.18,
      predicted: 0.25
    },
    reasoning: '当前发送时间对欧洲客户太早，对美国客户太晚。',
    implementation: '启用智能时区调度功能'
  }
];
```

---

## 6. 发送策略设计

### 6.1 新邮箱预热曲线（详细数值）

#### 14天预热计划表

| 天数 | 日发送量 | 发送时间 | 目标域分布 | 内容类型 | 监控指标 |
|-----|---------|---------|-----------|---------|---------|
| 1 | 10封 | 分散全天 | Gmail 40%, Outlook 30%, 其他30% | 纯文本 | 退信率<2% |
| 2 | 15封 | 分散全天 | Gmail 40%, Outlook 30%, 其他30% | 纯文本 | 打开率>35% |
| 3 | 20封 | 分散全天 | Gmail 40%, Outlook 30%, 其他30% | 简单HTML | 无投诉 |
| 4 | 25封 | 工作时间段 | 扩展至企业域名 | 简单HTML | 退信率<3% |
| 5 | 30封 | 工作时间段 | 扩展至企业域名 | 标准模板 | 打开率>30% |
| 6 | 35封 | 工作时间段 | 扩展至企业域名 | 标准模板 | 投诉率<0.1% |
| 7 | 40封 | 最佳时间段 | 全类型 | 标准模板 | 全部指标正常 |
| 8 | 45封 | 最佳时间段 | 全类型 | 标准模板 | 全部指标正常 |
| 9 | 50封 | 最佳时间段 | 全类型 | 标准模板 | 全部指标正常 |
| 10 | 60封 | 最佳时间段 | 全类型 | 标准模板 | 全部指标正常 |
| 11 | 70封 | 最佳时间段 | 全类型 | 标准模板 | 全部指标正常 |
| 12 | 80封 | 最佳时间段 | 全类型 | 标准模板 | 全部指标正常 |
| 13 | 90封 | 最佳时间段 | 全类型 | 标准模板 | 全部指标正常 |
| 14 | 100封 | 最佳时间段 | 全类型 | 标准模板 | 进入稳定期 |

### 6.2 发送频率智能调度

#### 发送队列算法

```typescript
interface SmartScheduler {
  // 队列优先级
  priorityRules: {
    warmup: 10;           // 预热邮件最高优先级
    timeSensitive: 8;     // 时效性邮件
    replyFollowUp: 7;     // 回复跟进
    scheduled: 5;         // 计划发送
    bulk: 3;              // 批量发送
  };
  
  // 限流算法
  rateLimiting: {
    algorithm: 'token_bucket';  // 令牌桶算法
    burstSize: number;
    refillRate: number;
  };
  
  // 发送窗口
  sendWindow: {
    timezone: string;
    startHour: number;    // 9
    endHour: number;      // 17
    workDaysOnly: boolean;
  };
}

// 队列管理
class EmailQueue {
  // 按域名分队列，避免单一域名发送过快
  domainQueues: Map<string, Queue<EmailJob>>;
  
  // 全局发送速率控制
  globalRateLimiter: RateLimiter;
  
  async processQueue(): Promise<void> {
    // 轮询各域名队列
    // 应用速率限制
    // 记录发送日志
  }
}
```

### 6.3 时区优化发送时间

#### 智能时区调度实现

```typescript
interface TimezoneScheduler {
  // 根据收件人邮箱或资料推断时区
  async inferTimezone(recipient: Recipient): Promise<string> {
    // 1. 从域名推断 (e.g., .co.uk -> Europe/London)
    // 2. 从历史数据
    // 3. 从IP地址
    // 4. 默认UTC
  }
  
  // 计算最优发送时间
  calculateOptimalTime(
    timezone: string,
    recipientHistory: EngagementHistory
  ): Date {
    const localTime = this.getLocalBusinessHours(timezone);
    
    // 如果有个性化历史数据，使用最佳互动时间
    if (recipientHistory.bestOpenTime) {
      return recipientHistory.bestOpenTime;
    }
    
    // 否则使用默认最佳时间
    return this.getDefaultOptimalTime(timezone);
  }
}
```

### 6.4 批量发送队列管理

#### 队列状态管理

```typescript
interface QueueStatus {
  campaignId: string;
  totalRecipients: number;
  queued: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  estimatedCompletion: Date;
  currentRate: number;  // 封/分钟
}

// 队列控制操作
interface QueueControl {
  pause(campaignId: string): void;
  resume(campaignId: string): void;
  throttle(campaignId: string, rate: number): void;
  cancel(campaignId: string): void;
  expedite(campaignId: string): void;  // 提速
}
```


#### 退订名单数据结构

```typescript
interface UnsubscribeRecord {
  email: string;
  domain: string;
  unsubscribedAt: Date;
  source: 'unsubscribe_link' | 'complaint' | 'manual' | 'bounce';
  campaignId?: string;
  reason?: string;
  // CAN-SPAM合规所需字段
  companyId: string;
  senderEmail: string;
  // 全局或局部退订
  scope: 'global' | 'company' | 'campaign';
}

// 退订名单服务
class UnsubscribeService {
  // 检查邮箱是否已退订
  async isUnsubscribed(email: string, companyId?: string): Promise<boolean>;
  
  // 添加退订记录
  async addUnsubscribe(record: UnsubscribeRecord): Promise<void>;
  
  // 导出退订名单（合规审计）
  async exportUnsubscribeList(companyId: string): Promise<UnsubscribeRecord[]>;
  
  // 重新订阅（需双重确认）
  async resubscribe(email: string, token: string): Promise<boolean>;
}
```

#### 实时同步机制

```
退订记录实时同步流程：

1. 用户点击退订链接
2. 系统立即将邮箱加入退订数据库
3. 通过消息队列广播到所有发送节点
4. 各发送节点更新本地缓存
5. 在TTL（建议5分钟）内完全生效

技术实现：
- 主存储：PostgreSQL（持久化）
- 缓存：Redis（快速查询）
- 同步：Redis Pub/Sub 或 Kafka
```

### 7.4 合规性保障

#### CAN-SPAM法案合规要求

| 要求 | 实现方式 | DealClaw措施 |
|-----|---------|-------------|
| 真实发件人信息 | 头部显示真实发送域名 | 强制DKIM签名 |
| 有效主题行 | 不得误导性主题 | AI主题检测 |
| 物理地址 | 邮件底部显示公司地址 | 模板强制包含 |
| 退订机制 | 简单明确的退订方式 | 一键退订链接 |
| 退订处理时效 | 10个工作日内处理 | 实时处理 |
| 退订后不再发送 | 严格黑名单管理 | 实时同步机制 |

#### GDPR合规要求（欧洲）

| 要求 | 实现方式 |
|-----|---------|
| 明确同意 | 记录邮件来源和授权方式 |
| 数据可携带 | 提供数据导出功能 |
| 被遗忘权 | 支持完全删除用户数据 |
| 数据处理记录 | 审计日志保存3年 |
| 数据保护官 | 指定DPO联系方式 |

#### 合规监控仪表板

```typescript
interface ComplianceDashboard {
  metrics: {
    unsubscribeRate: number;      // 退订率
    complaintRate: number;        // 投诉率
    bounceRate: number;           // 退信率
    consentValidity: number;      // 有效同意比例
  };
  
  alerts: Array<{
    type: 'compliance_violation' | 'threshold_exceeded';
    severity: 'critical' | 'warning';
    message: string;
    action: string;
  }>;
  
  auditLog: {
    last30Days: AuditRecord[];
    exportable: boolean;
  };
}
```

---

## 8. 监控指标和阈值设定

### 8.1 核心监控指标

#### 发送质量指标

| 指标名称 | 计算公式 | 健康阈值 | 警告阈值 | 危险阈值 | 采集频率 |
|---------|---------|---------|---------|---------|---------|
| 送达率 | 送达数/发送数 | >98% | 95-98% | <95% | 实时 |
| 硬退信率 | 硬退信数/发送数 | <1% | 1-2% | >2% | 实时 |
| 软退信率 | 软退信数/发送数 | <3% | 3-5% | >5% | 实时 |
| 投诉率 | 投诉数/送达数 | <0.1% | 0.1-0.3% | >0.3% | 实时 |
| 打开率 | 打开数/送达数 | >25% | 15-25% | <15% | 15分钟 |
| 点击率 | 点击数/送达数 | >3% | 1-3% | <1% | 15分钟 |
| 回复率 | 回复数/发送数 | >1% | 0.5-1% | <0.5% | 1小时 |
| 退订率 | 退订数/发送数 | <0.5% | 0.5-1% | >1% | 实时 |

#### 域名信誉指标

| 指标名称 | 来源 | 健康阈值 | 采集频率 |
|---------|------|---------|---------|
| 域名信誉分 | Google Postmaster | >80 | 每日 |
| IP信誉分 | Sender Score | >90 | 每日 |
| 黑名单状态 | 多黑名单检查 | 无黑名单 | 每小时 |
| SPF/DKIM/DMARC | DNS检查 | 全部通过 | 每6小时 |

### 8.2 告警规则配置

#### 告警级别定义

```yaml
alerts:
  critical:
    - name: 域名被列入黑名单
      condition: blacklist_count > 0
      notify: [email, sms, slack]
      action: 立即暂停发送
      
    - name: 投诉率超标
      condition: complaint_rate > 0.5%
      notify: [email, slack]
      action: 暂停发送并人工审核
      
    - name: 硬退信率超标
      condition: hard_bounce_rate > 5%
      notify: [email, slack]
      action: 暂停发送并清洗列表

  warning:
    - name: 退信率上升
      condition: bounce_rate > 3%
      notify: [email]
      action: 发送频率减半
      
    - name: 打开率下降
      condition: open_rate < 15% (连续3天)
      notify: [email]
      action: 内容优化建议
      
    - name: 退订率上升
      condition: unsubscribe_rate > 1%
      notify: [email]
      action: 检查内容相关性

  info:
    - name: Warm-up阶段完成
      condition: warmup_days >= 14 && metrics_normal
      notify: [email]
      action: 自动提升发送限额
      
    - name: 域名信誉提升
      condition: reputation_score_increased
      notify: [email]
      action: 通知客户
```

### 8.3 监控仪表板设计

#### 实时监控大屏

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DealClaw 邮件系统实时监控大屏                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  今日发送    │  │  送达率     │  │  打开率     │  │  投诉率     │   │
│  │  12,458     │  │   97.8%     │  │   28.3%     │  │   0.05%     │   │
│  │  ↑ 12%      │  │  ↑ 0.5%     │  │  ↓ 2.1%     │  │  ↑ 0.02%    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐     │
│  │      发送趋势（24小时）       │  │      域名健康状态            │     │
│  │                             │  │                             │     │
│  │    发送量 ▲                 │  │  ● mail.acme.com      优秀   │     │
│  │      ╱╲                     │  │  ● mail.techcorp.com  良好   │     │
│  │     ╱  ╲                    │  │  ● outreach.xyz.com   观察   │     │
│  │    ╱    ╲______            │  │  ⚠ mail.newbie.com    预警   │     │
│  │   ╱            ╲____        │  │                             │     │
│  │  ╱                  ╲       │  │  图例: ●正常 ⚠警告 ❌异常   │     │
│  │ └────────────────────▶     │  │                             │     │
│  │   00  06  12  18  24       │  │                             │     │
│  └─────────────────────────────┘  └─────────────────────────────┘     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │                        实时告警                              │       │
│  │  时间        级别    域名               消息                  │       │
│  │  10:23      WARN    mail.newbie.com   退信率超过3%            │       │
│  │  09:45      INFO    mail.acme.com     Warm-up完成             │       │
│  │  08:12      WARN    outreach.xyz.com  打开率下降              │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. 应急处理流程

### 9.1 域名被列入黑名单

#### 应急响应流程

```
┌────────────────────────────────────────────────────────────────┐
│                    黑名单应急响应流程                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [监控告警] 域名被列入XXX黑名单                                  │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────┐                    │
│  │ T+0分钟: 自动响应                      │                    │
│  │ - 立即停止该域名所有发送                │                    │
│  │ - 切换至备用发送域名                    │                    │
│  │ - 通知运营团队                          │                    │
│  └────────────────────────────────────────┘                    │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────┐                    │
│  │ T+15分钟: 初步诊断                     │                    │
│  │ - 确认黑名单类型和原因                  │                    │
│  │ - 检查近期发送内容和行为                │                    │
│  │ - 评估影响范围                          │                    │
│  └────────────────────────────────────────┘                    │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────┐                    │
│  │ T+1小时: 原因排查                      │                    │
│  │ - 内容审查：是否含垃圾词汇              │                    │
│  │ - 行为审查：发送频率是否异常            │                    │
│  │ - 列表审查：是否有 purchased list       │                    │
│  │ - 技术审查：是否被恶意利用              │                    │
│  └────────────────────────────────────────┘                    │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────┐                    │
│  │ T+4小时: 问题解决                      │                    │
│  │ - 修复导致问题的根本原因                │                    │
│  │ - 清理邮箱列表                          │                    │
│  │ - 调整发送策略                          │                    │
│  └────────────────────────────────────────┘                    │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────┐                    │
│  │ T+24小时: 申诉解封                     │                    │
│  │ - 向黑名单提供商提交解封申请            │                    │
│  │ - 提供问题修复证明                      │                    │
│  │ - 等待审核结果                          │                    │
│  └────────────────────────────────────────┘                    │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────┐                    │
│  │ T+3-7天: 恢复与复盘                    │                    │
│  │ - 解封后逐步恢复发送                    │                    │
│  │ - 加强监控频率                          │                    │
│  │ - 事件复盘和流程优化                    │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 9.2 大规模退信事件

#### 触发条件
- 硬退信率 > 10%（单小时内）
- 软退信率 > 20%（单小时内）

#### 处理流程

1. **立即响应（T+0）**
   - 暂停相关Campaign
   - 触发告警通知
   - 保留现场日志

2. **原因分析（T+30分钟）**
   - 检查退信类型分布
   - 检查目标域名分布
   - 检查邮件内容
   - 检查发送IP信誉

3. **问题解决（T+2小时）**
   - 如列表质量问题：清洗邮箱列表
   - 如内容问题：修改邮件内容
   - 如IP问题：切换发送通道
   - 如对方服务器问题：等待恢复

4. **恢复发送（T+4小时后）**
   - 小批量测试发送
   - 确认指标正常后逐步恢复

### 9.3 投诉激增事件

#### 触发条件
- 投诉率 > 0.5%（单日）
- 投诉数量 > 10（单小时内）

#### 处理流程

1. **立即暂停**
   - 停止所有相关发送
   - 分析投诉邮件样本

2. **根因分析**
   - 检查邮件内容合规性
   - 检查发送对象是否精准
   - 检查退订机制是否正常
   - 检查是否被恶意投诉

3. **纠正措施**
   - 内容不合规：修改模板
   - 对象不精准：优化目标客户筛选
   - 退订问题：修复退订功能
   - 恶意投诉：收集证据申诉

4. **恢复策略**
   - 重新预热域名
   - 降低发送频率
   - 加强内容审核

---

## 10. UI界面设计建议

### 10.1 域名配置向导

#### 配置流程设计

```
┌────────────────────────────────────────────────────────────────┐
│                    域名配置向导 - 步骤1/4                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  选择邮箱归属方案                                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                                                      │      │
│  │  ○ 使用 DealClaw 统一域名                             │      │
│  │    └─ 适合试用，无需配置，但有发送限制                   │      │
│  │                                                      │      │
│  │  ● 使用我的子域名（推荐）                              │      │
│  │    └─ 如: mail.yourcompany.com                        │      │
│  │                                                      │      │
│  │  ○ 使用我的主域名                                      │      │
│  │    └─ 如: sales@yourcompany.com                       │      │
│  │                                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  [   取消   ]                      [   下一步   ]              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────┐
│                    域名配置向导 - 步骤2/4                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  输入您的域名信息                                                 │
│                                                                 │
│  主域名： [ yourcompany.com                    ]               │
│                                                                 │
│  子域名前缀： [ mail              ] .yourcompany.com           │
│           └─ 推荐使用: mail / outreach / sales                │
│                                                                 │
│  建议的发件人邮箱：                                               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ • sales@mail.yourcompany.com                         │      │
│  │ • support@mail.yourcompany.com                       │      │
│  │ • john@mail.yourcompany.com                          │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  [   上一步   ]                    [   生成DNS配置   ]          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────┐
│                    域名配置向导 - 步骤3/4                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  请在您的DNS服务商处添加以下记录                                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────────┐
│  │ 记录类型 │ 主机记录              │ 记录值                      │
│  ├──────────────────────────────────────────────────────────────┤
│  │ TXT      │ mail                  │ v=spf1 include:send...     │
│  │ TXT      │ s1._domainkey.mail    │ v=DKIM1; k=rsa; p=...      │
│  │ TXT      │ s2._domainkey.mail    │ v=DKIM1; k=rsa; p=...      │
│  │ TXT      │ _dmarc.mail           │ v=DMARC1; p=none; rua...   │
│  └──────────────────────────────────────────────────────────────┘
│                                                                 │
│  [一键复制所有记录]  [查看配置视频教程]                            │
│                                                                 │
│  常见DNS服务商配置指南：                                          │
│  [Cloudflare] [GoDaddy] [阿里云] [腾讯云] [Namecheap]            │
│                                                                 │
│  [   上一步   ]                    [   验证配置   ]              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────┐
│                    域名配置向导 - 步骤4/4                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  配置验证结果                                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                                                      │      │
│  │  ✅ SPF 记录    已正确配置                           │      │
│  │     └─ 检测值: v=spf1 include:sendgrid.net...       │      │
│  │                                                      │      │
│  │  ✅ DKIM 记录   已正确配置                           │      │
│  │     └─ Selector: s1, s2 均有效                      │      │
│  │                                                      │      │
│  │  ✅ DMARC 记录  已正确配置                           │      │
│  │     └─ 策略: p=none (监控模式)                      │      │
│  │                                                      │      │
│  │  ⏳ 域名信誉    预热中 (第3天/14天)                  │      │
│  │     └─ 当前限额: 40封/天                            │      │
│  │                                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  恭喜！您的域名配置已完成，现在可以开始发送邮件了。                  │
│                                                                 │
│                    [   进入邮件发送页面   ]                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 10.2 发送控制台

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DealClaw 邮件发送控制台                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────────────────────┐  │
│  │                 │  │  新活动                                      │  │
│  │  📊 活动列表     │  │  ┌─────────────────────────────────────┐   │  │
│  │                 │  │  │  活动名称: [                         ]│   │  │
│  │  ● 春季促销      │  │  │  发件人:   [ sales@mail.acme.com  ▼ ]│   │  │
│  │  ○ 产品发布      │  │  │  收件人:   [ 选择列表或上传CSV    ▼ ]│   │  │
│  │  ○ 客户回访      │  │  │         共 1,250 个收件人               │   │  │
│  │                 │  │  │                                      │   │  │
│  │  [+ 新建活动]   │  │  │  选择模板:                              │   │  │
│  │                 │  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │   │  │
│  └─────────────────┘  │  │  │模板1│ │模板2│ │模板3│ │+新建│      │   │  │
│                       │  │  └─────┘ └─────┘ └─────┘ └─────┘      │   │  │
│  ┌─────────────────┐  │  │                                      │   │  │
│  │  📈 发送统计     │  │  │  发送设置:                              │   │  │
│  │                 │  │  │  ○ 立即发送                              │   │  │
│  │  今日发送: 458  │  │  │  ● 智能调度（推荐）                       │   │  │
│  │  送达率: 98.2%  │  │  │    时区: [ 按收件人时区           ▼ ]  │   │  │
│  │  打开率: 26.5%  │  │  │    时间: [ 上午9-11点（当地时间） ▼ ]  │   │  │
│  │                 │  │  │                                      │   │  │
│  └─────────────────┘  │  │  [   预览邮件  ]  [   开始发送   ]    │   │  │
│                       │  └─────────────────────────────────────┘   │  │
│  ┌─────────────────┐  │                                             │  │
│  │  ⚙️ 域名健康     │  │  预计发送时间: 根据收件人时区，约需2天完成      │  │
│  │                 │  │  预计消耗额度: 1,250 封                       │  │
│  │  ● mail.acme.com│  │                                             │  │
│  │    状态: 正常   │  │  💡 建议：您的域名正在预热期，建议每日不超过50封  │  │
│  │    信誉: 85/100 │  │                                             │  │
│  │                 │  │                                             │  │
│  └─────────────────┘  │                                             │  │
│                       └─────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.3 效果分析仪表板

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 邮件效果分析 - 春季促销 (2026-03-01 至 2026-03-26)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  发送    │  送达    │  打开    │  点击    │  回复    │  退订    │  │
│  │  12,458  │  12,213  │  3,461   │   487    │   156    │    42    │  │
│  │          │  98.0%   │  28.3%   │  4.0%    │  1.3%    │  0.3%    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐     │
│  │     转化漏斗                 │  │     打开率趋势（7天）        │     │
│  │                             │  │                             │     │
│  │    发送  ████████████████   │  │     ▲                       │     │
│  │    12.5K                    │  │  35%┤    ╭╮                  │     │
│  │      ↓ 98%                  │  │     │   ╱  ╲╭╮               │     │
│  │    送达  ██████████████     │  │  25%┤──╱────╳──╮            │     │
│  │    12.2K                    │  │     │ ╱      ╰╯╲             │     │
│  │      ↓ 28.3%                │  │  15%┤╱                  ╲    │     │
│  │    打开  █████              │  │     └────────────────▶      │     │
│  │    3.5K                     │  │      20 21 22 23 24 25 26   │     │
│  │      ↓ 14.1%                │  │                             │     │
│  │    点击  █                  │  │                             │     │
│  │    487                      │  │                             │     │
│  │                             │  │                             │     │
│  └─────────────────────────────┘  └─────────────────────────────┘     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │                   🎯 AI 优化建议                             │       │
│  ├─────────────────────────────────────────────────────────────┤       │
│  │                                                             │       │
│  │  1. 发送时间优化                                            │       │
│  │     当前：统一在UTC时间08:00发送                             │       │
│  │     建议：启用智能时区调度，预计打开率提升15%                 │       │
│  │     [立即启用]                                              │       │
│  │                                                             │       │
│  │  2. 主题行优化                                              │       │
│  │     当前："Spring Promotion - Best Price"                    │       │
│  │     建议："Quick question about your {Product} sourcing"     │       │
│  │     [应用建议] [查看更多建议]                                 │       │
│  │                                                             │       │
│  │  3. 目标受众优化                                            │       │
│  │     发现：电子产品类别打开率高出平均水平40%                   │       │
│  │     建议：增加电子产品类别收件人比例                          │       │
│  │     [查看详情]                                              │       │
│  │                                                             │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.4 域名健康监控页面

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 域名健康监控                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  当前域名: mail.acme.com                                                │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  总体健康评分                                    85/100 良好   │    │
│  │  ████████████████████████████████████░░░░░░░░░░                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  DNS配置状态:                                                            │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  ✅ SPF 记录    已配置  最后检测: 2小时前                        │    │
│  │  ✅ DKIM 记录   已配置  最后检测: 2小时前                        │    │
│  │  ✅ DMARC 记录  已配置  最后检测: 2小时前                        │    │
│  │  ✅ MX 记录     已配置  最后检测: 2小时前                        │    │
│  │  [重新检测]  [查看详细配置]                                      │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  黑名单监控:                                                             │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  状态: ✅ 未在任何黑名单发现                                     │    │
│  │  最后扫描: 30分钟前    扫描频率: 每小时                         │    │
│  │  监控列表: Spamhaus, Barracuda, SpamCop, SURBL, UCEPROTECT...   │    │
│  │  [查看扫描报告]                                                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  域名信誉趋势:                                                            │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │     ▲                                                          │    │
│  │ 100┤                ╭╮                                          │    │
│  │    │               ╱  ╲╭╮                                       │    │
│  │  80┤────╮         ╱    ╳──── 当前信誉: 85 (良好)                │    │
│  │    │    ╲╭╮────╮╱    ╱                                        │    │
│  │  60┤     ╰╯    ╰────╱                                          │    │
│  │    └────────────────────────────▶                             │    │
│  │       W1  W2  W3  W4  W5  W6  W7  W8                          │    │
│  │                                                                │    │
│  │  [查看Google Postmaster数据]                                    │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  Warm-up进度:                                                            │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  当前阶段: 稳定期 (第8周)                                        │    │
│  │  日发送限额: 1,000封                                            │    │
│  │  进度: ████████████████████████░░░░░░ 80%                      │    │
│  │  预计完成正常化: 2026-04-15                                     │    │
│  │  完成后限额: 10,000封/天                                        │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  最近30天统计:                                                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐           │
│  │  发送: 15.2K │  送达率: 98% │  投诉率: 0.05%│  退信率: 1.2% │           │
│  └─────────────┴─────────────┴─────────────┴─────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. 技术实现要点

### 11.1 核心技术栈建议

| 组件 | 推荐技术 | 备选方案 |
|-----|---------|---------|
| 邮件发送服务 | SendGrid | AWS SES, Mailgun, Postmark |
| 队列系统 | Apache Kafka | RabbitMQ, AWS SQS |
| 任务调度 | Bull Queue (Redis) | Celery, Sidekiq |
| 监控告警 | Prometheus + Grafana | Datadog, New Relic |
| DNS验证 | Node.js dns模块 | dig CLI, Google DNS API |
| 黑名单检查 | Multi-RBL API | 自建DNS查询 |

### 11.2 关键API设计

```typescript
// 发送邮件API
POST /api/v1/email/send
{
  "campaignId": "string",
  "from": "sales@mail.customer.com",
  "to": ["recipient@example.com"],
  "subject": "string",
  "body": "string",
  "tracking": {
    "open": true,
    "click": true
  },
  "schedule": {
    "mode": "immediate" | "timezone_optimized" | "specific_time",
    "time": "2026-03-26T09:00:00Z"
  }
}

// 域名验证API
GET /api/v1/domain/validate?domain=mail.customer.com

// 获取发送统计API
GET /api/v1/campaigns/{id}/stats

// 退订API
POST /api/v1/unsubscribe
{
  "email": "user@example.com",
  "token": "string",
  "reason": "optional"
}
```

### 11.3 数据模型设计

```typescript
// 域名实体
interface Domain {
  id: string;
  customerId: string;
  domain: string;           // mail.customer.com
  type: 'shared' | 'subdomain' | 'custom';
  dnsRecords: DNSRecords;
  verificationStatus: 'pending' | 'verified' | 'failed';
  reputation: {
    score: number;
    history: ReputationPoint[];
  };
  warmupStatus: {
    phase: string;
    startedAt: Date;
    currentLimit: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 发送活动实体
interface Campaign {
  id: string;
  customerId: string;
  name: string;
  domainId: string;
  from: string;
  templateId: string;
  recipientList: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed';
  schedule: ScheduleConfig;
  stats: CampaignStats;
  createdAt: Date;
}

// 邮件记录实体
interface EmailLog {
  id: string;
  campaignId: string;
  recipient: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
  events: EmailEvent[];
  metadata: {
    ip: string;
    userAgent?: string;
    timestamp: Date;
  };
}
```

---

## 12. 总结

### 12.1 关键决策点

| 决策项 | 推荐方案 | 理由 |
|-------|---------|------|
| 邮箱归属 | 子域名方案为主 | 平衡品牌与风险 |
| 发送通道 | SendGrid + AWS SES | 可靠性与成本平衡 |
| 预热策略 | 14天渐进式 | 行业最佳实践 |
| 发送控制 | 信誉分层动态限流 | 智能化管理 |
| 监控系统 | 实时+定时结合 | 全面覆盖 |

### 12.2 实施路线图

| 阶段 | 周期 | 目标 | 关键交付 |
|-----|------|------|---------|
| Phase 1 | 2周 | 基础架构 | DNS配置、基础发送、Warm-up |
| Phase 2 | 2周 | 监控系统 | 黑名单监控、告警系统 |
| Phase 3 | 2周 | 智能优化 | AI建议、时区调度 |
| Phase 4 | 2周 | 高级功能 | 自动化修复、深度分析 |

### 12.3 成功指标

- 邮件送达率 > 98%
- 收件箱率 > 85%
- 域名黑名单事件 < 1次/季度
- 客户投诉率 < 0.1%
- 自动化处理率 > 90%

---

*文档版本: V1.0*
*最后更新: 2026-03-26*
*作者: DealClaw 产品团队*
