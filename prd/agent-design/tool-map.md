# DealClaw 工具地图设计

> 版本: V1.0  
> 更新日期: 2026-03-30  
> 设计原则: 每个工具都是Agent的能力边界，明确定义输入输出、失败处理

---

## 1. 工具分类体系

### 1.1 工具类型分层

```
工具地图
├── 理解层工具 (Understanding)
│   ├── 意图识别 (Intent Recognition)
│   ├── 实体提取 (Entity Extraction)
│   └── 情感分析 (Sentiment Analysis)
│
├── 数据层工具 (Data)
│   ├── 企业库查询 (Company Database Query)
│   ├── 海关数据匹配 (Customs Data Matching)
│   ├── 关键词库查询 (Keyword Database Query)
│   └── 线索数据操作 (Lead Data Operations)
│
├── 生成层工具 (Generation)
│   ├── SEO文章生成 (SEO Article Generation)
│   ├── 开发信生成 (Email Content Generation)
│   ├── 回复建议生成 (Reply Suggestion Generation)
│   └── 内容优化 (Content Optimization)
│
├── 执行层工具 (Execution)
│   ├── 邮件发送 (Email Sending)
│   ├── 站点内容发布 (Website Publishing)
│   ├── 数据同步 (Data Synchronization)
│   └── 通知推送 (Notification Push)
│
├── 质量层工具 (Quality)
│   ├── 内容质量检测 (Content Quality Check)
│   ├── 邮件信誉检查 (Email Reputation Check)
│   └── 线索评分 (Lead Scoring)
│
└── 系统层工具 (System)
    ├── 记忆存储 (Memory Storage)
    ├── 记忆检索 (Memory Retrieval)
    └── 日志记录 (Logging)
```

### 1.2 工具依赖关系

```
意图识别
    │
    ├──► 实体提取 ──► 企业库查询 ──► 海关数据匹配
    │
    ├──► 生成类工具
    │       ├──► SEO文章生成 ──► 质量检测 ──► 站点发布
    │       └──► 开发信生成 ──► 质量检测 ──► 邮件发送
    │
    └──► 数据类工具
            ├──► 线索评分 ──► 通知推送
            └──► 记忆检索/存储
```

---

## 2. 理解层工具

### 2.1 意图识别 (Intent Recognition)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_intent_recognition |
| 所属Agent | 主管Agent |
| 调用频率 | 每次用户输入 |

**触发条件**:
- 收到用户文本输入
- 上下文切换需要重新识别

**输入格式**:
```json
{
  "text": "帮我找美国户外用品批发商",
  "context": {
    "conversation_id": "conv_123",
    "last_intent": "create_task",
    "current_task_id": "task_456",
    "session_history": [...]
  },
  "user_profile": {
    "user_id": "user_789",
    "enterprise_id": "ent_012"
  }
}
```

**输出格式**:
```json
{
  "intent": "create_task",
  "confidence": 0.92,
  "alternative_intents": [
    {"intent": "query_progress", "confidence": 0.05},
    {"intent": "get_leads", "confidence": 0.03}
  ],
  "entities": {
    "region": {"value": "美国", "confidence": 0.98},
    "industry": {"value": "户外用品", "confidence": 0.95}
  },
  "requires_clarification": false,
  "processing_time_ms": 150
}
```

**失败处理**:
| 失败类型 | 判定条件 | 降级方案 | 通知用户 |
|---------|---------|---------|---------|
| 超时 | >2s | 使用规则匹配 | 否 |
| API错误 | 5xx | 使用缓存模型 | 否 |
| 低置信度 | <0.6 | 标记需澄清 | 是 |

**超时**: 2s  
**重试**: 1次  
**降级**: 规则匹配

---

### 2.2 实体提取 (Entity Extraction)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_entity_extraction |
| 所属Agent | 主管Agent |
| 调用频率 | 每次意图识别后 |

**触发条件**:
- 意图识别完成
- 需要提取槽位值

**输入格式**:
```json
{
  "text": "帮我找美国户外用品批发商",
  "intent": "create_task",
  "required_slots": ["region", "industry"],
  "optional_slots": ["company_size", "timeline"],
  "context": {...}
}
```

**输出格式**:
```json
{
  "slots": {
    "region": {
      "value": "美国",
      "normalized": "US",
      "confidence": 0.98,
      "source": "exact_match"
    },
    "industry": {
      "value": "户外用品",
      "normalized": "outdoor_gear",
      "confidence": 0.95,
      "source": "keyword_match"
    }
  },
  "missing_required": [],
  "completeness": 0.6
}
```

**失败处理**:
| 失败类型 | 降级方案 |
|---------|---------|
| 模型失败 | 正则表达式匹配 |
| 部分提取失败 | 标记缺失字段 |

**超时**: 1s  
**重试**: 0次  
**降级**: 正则匹配

---

## 3. 数据层工具

### 3.1 企业库查询 (Company Database Query)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_company_query |
| 所属Agent | Email Agent, 数据Agent |
| 调用频率 | 创建任务时、筛选客户时 |

**触发条件**:
- 需要筛选目标客户
- 需要验证公司信息

**输入格式**:
```json
{
  "filters": {
    "region": ["US"],
    "industry": ["outdoor_gear"],
    "company_size": {"min": 50, "max": 200},
    "has_customs_data": true
  },
  "pagination": {
    "page": 1,
    "page_size": 100
  },
  "sort_by": "relevance_score",
  "include_fields": ["name", "website", "email", "phone", "size"]
}
```

**输出格式**:
```json
{
  "companies": [
    {
      "id": "comp_001",
      "name": "Outdoor Gear Co.",
      "region": "California, US",
      "industry": "outdoor_gear",
      "size": 120,
      "website": "outdoorgearco.com",
      "email": "contact@outdoorgearco.com",
      "relevance_score": 0.92,
      "data_sources": ["company_db", "linkedin"]
    }
  ],
  "total": 856,
  "page": 1,
  "page_size": 100,
  "query_time_ms": 450
}
```

**失败处理**:
| 失败类型 | 降级方案 | 用户通知 |
|---------|---------|---------|
| 超时 | 使用缓存数据 | "使用缓存数据，可能不是最新" |
| 无结果 | 放宽筛选条件 | "未找到精确匹配，已放宽条件" |
| API错误 | 使用备用数据源 | 静默降级 |

**超时**: 5s  
**重试**: 2次  
**降级**: 缓存数据

---

### 3.2 海关数据匹配 (Customs Data Matching)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_customs_matching |
| 所属Agent | Email Agent |
| 调用频率 | 筛选客户时（可选增强） |

**触发条件**:
- 需要验证采购历史
- 需要增强客户画像

**输入格式**:
```json
{
  "company_name": "Outdoor Gear Co.",
  "region": "US",
  "match_threshold": 0.85
}
```

**输出格式**:
```json
{
  "match_found": true,
  "confidence": 0.91,
  "import_records": [
    {
      "date": "2024-01",
      "product_category": "camping_tents",
      "value_usd": 150000,
      "quantity": 500,
      "supplier_country": "CN"
    }
  ],
  "annual_import_value": 1800000,
  "main_suppliers": ["CN", "VN"],
  "trend": "increasing"
}
```

**失败处理**:
| 失败类型 | 降级方案 |
|---------|---------|
| 无匹配 | 跳过此维度，不扣分 |
| 超时 | 异步获取，先展示基础信息 |
| API限制 | 使用汇总数据而非详细记录 |

**超时**: 3s  
**重试**: 2次  
**降级**: 跳过维度

---

### 3.3 关键词库查询 (Keyword Database Query)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_keyword_query |
| 所属Agent | SEO Agent |
| 调用频率 | 制定SEO策略时 |

**触发条件**:
- SEO Agent制定内容策略
- 需要推荐目标关键词

**输入格式**:
```json
{
  "product": "camping tent",
  "target_market": "US",
  "language": "en",
  "max_results": 20,
  "filters": {
    "min_search_volume": 100,
    "max_difficulty": 60
  }
}
```

**输出格式**:
```json
{
  "keywords": [
    {
      "keyword": "wholesale camping tents",
      "search_volume": 1300,
      "difficulty": 45,
      "cpc": 2.5,
      "relevance_score": 0.95,
      "priority": "high"
    }
  ],
  "total_available": 156,
  "recommendation": "Focus on long-tail keywords with volume 500-2000"
}
```

**失败处理**:
| 失败类型 | 降级方案 |
|---------|---------|
| 无匹配 | 使用通用关键词库 |
| 超时 | 使用缓存的热门关键词 |
| 数据不完整 | 降低筛选条件 |

**超时**: 3s  
**重试**: 2次  
**降级**: 通用关键词

---

## 4. 生成层工具

### 4.1 SEO文章生成 (SEO Article Generation)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_seo_article_gen |
| 所属Agent | SEO Agent |
| 调用频率 | 创建任务后、定期内容生成 |

**触发条件**:
- 需要生成SEO内容
- 用户请求生成文章

**输入格式**:
```json
{
  "topic": "2024 camping gear market trends",
  "target_keywords": ["wholesale camping tents", "bulk outdoor gear"],
  "enterprise_profile": {
    "product": "camping equipment",
    "advantages": ["OEM customization", "15 years experience"],
    "target_market": "US wholesale"
  },
  "tone": "professional",
  "word_count": 1200,
  "structure": "blog_post"
}
```

**输出格式**:
```json
{
  "title": "2024 Camping Gear Market Trends: Opportunities for Wholesalers",
  "content": "...",
  "word_count": 1250,
  "keywords_density": {
    "wholesale camping tents": 1.2,
    "bulk outdoor gear": 0.8
  },
  "readability_score": 75,
  "estimated_reading_time": 6,
  "generation_time_ms": 8500
}
```

**失败处理**:
| 失败类型 | 降级方案 | 质量影响 |
|---------|---------|---------|
| 超时(>30s) | 提供文章框架+人工填充 | 需人工完成 |
| 内容质量低 | 降低字数要求，重新生成 | 篇幅缩短 |
| API错误 | 使用模板填充关键信息 | 个性化降低 |

**超时**: 30s  
**重试**: 1次  
**降级**: 文章框架

---

### 4.2 开发信生成 (Email Generation)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_email_generation |
| 所属Agent | Email Agent |
| 调用频率 | 批量生成开发信时 |

**触发条件**:
- 需要生成个性化开发信
- 需要优化现有邮件

**输入格式**:
```json
{
  "recipient": {
    "company_name": "Outdoor Gear Co.",
    "contact_name": "Mike",
    "title": "Purchasing Manager",
    "region": "California",
    "recent_news": "opened new store in San Diego"
  },
  "sender_profile": {
    "company_name": "XYZ Camping",
    "product": "camping tents",
    "advantages": ["OEM", "competitive pricing"],
    "moq": 100
  },
  "email_type": "cold_outreach",
  "personalization_level": "high"
}
```

**输出格式**:
```json
{
  "subject": "Re: Quality Camping Gear Supply - OEM Available",
  "body": "Hi Mike,\n\nI noticed Outdoor Gear Co. has been expanding...",
  "personalization_score": 0.88,
  "highlights": [
    "提及客户新店开业",
    "匹配客户所在地区",
    "突出OEM优势"
  ],
  "spam_score": 2,
  "generation_time_ms": 3200
}
```

**失败处理**:
| 失败类型 | 降级方案 |
|---------|---------|
| 超时 | 使用通用模板+基础个性化 |
| 个性化失败 | 降低个性化程度，保证送达 |
| 垃圾分高 | 重写，降低促销词汇 |

**超时**: 10s  
**重试**: 1次  
**降级**: 通用模板

---

### 4.3 内容优化 (Content Optimization)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_content_optimization |
| 所属Agent | SEO Agent, Email Agent |
| 调用频率 | 用户请求优化时 |

**触发条件**:
- 用户请求优化内容
- 质量检测未通过

**输入格式**:
```json
{
  "original_content": "...",
  "content_type": "email|article|reply",
  "optimization_goal": "open_rate|reply_rate|seo_ranking",
  "constraints": {
    "max_length": 500,
    "tone": "professional",
    "must_include": ["OEM", "competitive price"]
  }
}
```

**输出格式**:
```json
{
  "optimized_content": "...",
  "changes_made": [
    {"type": "subject_line", "before": "...", "after": "..."},
    {"type": "opening", "before": "...", "after": "..."}
  ],
  "improvement_score": 0.25,
  "predicted_open_rate": 0.32,
  "predicted_reply_rate": 0.08
}
```

**超时**: 8s  
**重试**: 1次  
**降级**: 提供优化建议而非自动改写

---

## 5. 执行层工具

### 5.1 邮件发送 (Email Sending)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_email_sending |
| 所属Agent | Email Agent |
| 调用频率 | 用户确认后 |

**⚠️ 风险操作**: 需人工确认

**触发条件**:
- 用户确认发送
- 定时任务触发

**输入格式**:
```json
{
  "recipients": [
    {
      "email": "mike@outdoorgearco.com",
      "subject": "...",
      "body": "...",
      "personalization_data": {...}
    }
  ],
  "sending_strategy": {
    "batch_size": 30,
    "daily_limit": 50,
    "send_time": "09:00",
    "timezone": "America/Los_Angeles"
  },
  "sender_config": {
    "email": "sarah@xyzcamping.com",
    "smtp_settings": {...}
  }
}
```

**输出格式**:
```json
{
  "batch_id": "batch_123",
  "total_recipients": 800,
  "scheduled_batches": 27,
  "estimated_completion": "2024-04-27",
  "status": "scheduled",
  "warnings": [
    "Daily limit reduced to 50 for warming up"
  ]
}
```

**失败处理**:
| 失败类型 | 降级方案 | 用户通知 |
|---------|---------|---------|
| SMTP错误 | 切换备用邮箱 | "已切换发送邮箱" |
| 退信率高 | 暂停发送，诊断问题 | "检测到异常，已暂停" |
| 发送限制 | 降低发送频率 | "已调整发送策略" |
| 单封失败 | 记录失败，继续其他 | 批量完成后汇总 |

**超时**: 5s  
**重试**: 2次  
**降级**: 暂停+提示检查

**批量发送规则**:
```
数量 ≤ 50: 直接执行
50 < 数量 ≤ 100: 确认策略后执行
数量 > 100: **双重确认** + 分批执行
```

---

### 5.2 站点内容发布 (Website Publishing)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_website_publish |
| 所属Agent | SEO Agent |
| 调用频率 | 用户确认发布后 |

**⚠️ 风险操作**: 单条确认

**触发条件**:
- 用户确认发布
- 定时发布触发

**输入格式**:
```json
{
  "content": {
    "title": "...",
    "body": "...",
    "excerpt": "...",
    "featured_image": "...",
    "tags": ["camping", "wholesale"]
  },
  "website_config": {
    "platform": "wordpress|shopify",
    "api_endpoint": "...",
    "credentials": {...},
    "category": "blog"
  },
  "seo_settings": {
    "meta_title": "...",
    "meta_description": "...",
    "slug": "2024-camping-trends"
  }
}
```

**输出格式**:
```json
{
  "post_id": "post_456",
  "status": "published",
  "url": "https://xyzcamping.com/blog/2024-camping-trends",
  "published_at": "2024-03-30T10:00:00Z",
  "submission_status": {
    "google": "submitted",
    "bing": "submitted"
  }
}
```

**失败处理**:
| 失败类型 | 降级方案 |
|---------|---------|
| 发布失败 | 保存草稿+提示检查配置 |
| SEO提交失败 | 标记为手动提交 |
| 图片上传失败 | 发布无图版本+提示 |

**超时**: 10s  
**重试**: 2次  
**降级**: 保存草稿

---

## 6. 质量层工具

### 6.1 内容质量检测 (Content Quality Check)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_quality_check |
| 所属Agent | SEO Agent, Email Agent |
| 调用频率 | 内容生成后 |

**触发条件**:
- 内容生成完成
- 用户上传内容审核

**输入格式**:
```json
{
  "content": "...",
  "content_type": "article|email",
  "check_items": ["originality", "readability", "ai_detection", "spam_score"]
}
```

**输出格式**:
```json
{
  "overall_score": 85,
  "checks": {
    "originality": {"score": 96, "passed": true},
    "readability": {"score": 78, "passed": true, "level": "standard"},
    "ai_detection": {"score": 15, "passed": true, "risk": "low"},
    "spam_score": {"score": 2, "passed": true, "max_allowed": 5}
  },
  "suggestions": [
    "考虑增加小标题提升可读性",
    "关键词密度可适当提高"
  ],
  "passed": true
}
```

**失败处理**:
| 失败类型 | 降级方案 |
|---------|---------|
| AI痕迹高 | 自动重写降重 |
| 原创度低 | 提示修改或重写 |
| 可读性差 | 提供改写建议 |

**超时**: 5s  
**重试**: 1次  
**降级**: 人工标注待审核

---

### 6.2 线索评分 (Lead Scoring)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_lead_scoring |
| 所属Agent | 线索Agent |
| 调用频率 | 新线索进入时 |

**触发条件**:
- 新线索捕获
- 互动数据更新

**输入格式**:
```json
{
  "lead_data": {
    "company_info": {...},
    "interaction_history": [
      {"type": "email_open", "timestamp": "...", "count": 3},
      {"type": "email_reply", "timestamp": "...", "content": "..."},
      {"type": "website_visit", "timestamp": "...", "pages": [...]}
    ]
  },
  "scoring_model": "v2.1"
}
```

**输出格式**:
```json
{
  "score": 92,
  "max_score": 100,
  "category": "hot",
  "factors": [
    {"factor": "email_opens", "weight": 0.2, "contribution": 18},
    {"factor": "email_reply", "weight": 0.4, "contribution": 40},
    {"factor": "website_visit", "weight": 0.2, "contribution": 16},
    {"factor": "company_match", "weight": 0.2, "contribution": 18}
  ],
  "recommendation": "high_priority_follow_up",
  "estimated_conversion": 0.35
}
```

**超时**: 2s  
**重试**: 1次  
**降级**: 使用中位数评分(50分)

---

## 7. 系统层工具

### 7.1 记忆存储 (Memory Storage)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_memory_store |
| 所属Agent | 主管Agent |
| 调用频率 | 关键信息更新时 |

**触发条件**:
- 企业画像更新
- 用户偏好学习
- 任务结果记录

**输入格式**:
```json
{
  "memory_type": "entity|preference|task|context",
  "content": {
    "key": "target_markets",
    "value": ["US", "Europe"],
    "metadata": {"source": "user_input", "confidence": 0.95}
  },
  "user_id": "user_789",
  "enterprise_id": "ent_012",
  "ttl_days": 90
}
```

**输出格式**:
```json
{
  "memory_id": "mem_abc",
  "stored": true,
  "version": 3,
  "previous_version": "mem_xyz"
}
```

**超时**: 500ms  
**重试**: 2次  
**降级**: 本地缓存+异步同步

---

### 7.2 记忆检索 (Memory Retrieval)

| 属性 | 值 |
|-----|---|
| 工具ID | tool_memory_retrieve |
| 所属Agent | 主管Agent |
| 调用频率 | 每次对话前 |

**触发条件**:
- 对话开始时组装上下文
- 需要回忆历史信息

**输入格式**:
```json
{
  "query": "target markets for outdoor gear",
  "query_type": "semantic|exact|hybrid",
  "filters": {
    "user_id": "user_789",
    "memory_types": ["entity", "preference"],
    "min_confidence": 0.7
  },
  "top_k": 5,
  "min_relevance": 0.6
}
```

**输出格式**:
```json
{
  "memories": [
    {
      "memory_id": "mem_001",
      "type": "entity",
      "content": {"key": "target_markets", "value": ["US", "Europe"]},
      "confidence": 0.95,
      "weight": 0.85,
      "last_accessed": "2024-03-28",
      "relevance_score": 0.92
    }
  ],
  "total_found": 12,
  "retrieval_time_ms": 120
}
```

**超时**: 500ms  
**重试**: 1次  
**降级**: 使用最近N条记忆

---

## 8. 工具调用监控

### 8.1 工具健康度指标

| 指标 | 目标值 | 告警阈值 |
|-----|-------|---------|
| 成功率 | >95% | <90% |
| 平均响应时间 | <阈值×1.2 | >阈值×2 |
| 降级率 | <5% | >10% |
| 错误率 | <2% | >5% |

### 8.2 工具依赖熔断

```python
# 伪代码示例
def invoke_tool(tool_id, params):
    circuit_breaker = get_circuit_breaker(tool_id)
    
    if circuit_breaker.is_open():
        # 熔断器开启，直接降级
        return fallback(tool_id, params)
    
    try:
        result = call_tool_api(tool_id, params)
        circuit_breaker.record_success()
        return result
    except TimeoutError:
        circuit_breaker.record_failure()
        return fallback(tool_id, params)
    except APIError as e:
        circuit_breaker.record_failure()
        if e.is_retryable():
            return retry_or_fallback(tool_id, params)
        raise
```

---

## 9. 自检清单

### 工具地图完成标准

- [x] 所有核心工具有明确的工具ID和所属Agent
- [x] 每个工具定义了触发条件、输入输出格式
- [x] 每个工具定义了超时时间、重试策略、降级方案
- [x] 风险操作（邮件发送、删除等）有确认机制
- [x] 工具依赖关系清晰
- [x] 工具健康度可监控

### 边界条件验证

1. **每个工具都有降级方案吗？**
   - ✅ 核心工具都有至少1个降级方案
   - ✅ 降级时告知用户质量影响
   - ✅ 严重失败时有暂停机制

2. **工具失败时能优雅降级吗？**
   - ✅ 超时→缓存/简化版
   - ✅ API错误→备用API/默认值
   - ✅ 数据缺失→放宽条件/跳过

3. **工具调用链可追踪吗？**
   - ✅ 每次调用记录trace_id
   - ✅ 失败时可定位问题工具
   - ✅ 支持工具调用回放
