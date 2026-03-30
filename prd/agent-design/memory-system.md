# DealClaw 长期记忆机制设计

> 版本: V1.0  
> 更新日期: 2026-03-30  
> 设计目标: 让Agent"记得"用户，持续学习优化

---

## 1. 核心设计原则

### 1.1 为什么需要长期记忆

| 场景 | 无记忆 ❌ | 有记忆 ✅ |
|-----|----------|----------|
| 用户再次登录 | "你好，请介绍您的企业" | "欢迎回来！上次您提到想拓展欧洲市场，进展如何？" |
| 创建类似任务 | 重复询问相同信息 | "和上次美国任务类似，是否沿用相同画像？" |
| 优化内容 | 不了解用户风格 | "基于您偏好的简洁风格，已调整内容" |
| 异常处理 | 重复犯同样错误 | "上次您纠正过这一点，已更新理解" |

### 1.2 记忆设计三问

1. **什么值得记住？** - 影响未来交互的信息
2. **如何组织记忆？** - 结构化+语义化+权重
3. **何时使用记忆？** - 上下文组装时智能召回

---

## 2. 记忆类型体系

### 2.1 记忆分类树

```
长期记忆
├── 企业知识（Enterprise Knowledge）
│   ├── 企业画像（静态）
│   │   ├── 产品信息
│   │   ├── 核心优势
│   │   ├── 目标市场
│   │   └── 客户类型
│   ├── 业务背景（半静态）
│   │   ├── 主营品类
│   │   ├── 价格定位
│   │   └── 成交案例
│   └── 资质认证（静态）
│
├── 用户偏好（User Preferences）
│   ├── 沟通风格
│   │   ├── 正式/ casual
│   │   ├── 详细/简洁
│   │   └── 主动/被动
│   ├── 决策习惯
│   │   ├── 保守/激进
│   │   ├── 数据驱动/直觉
│   │   └── 快速/谨慎
│   └── 交互偏好
│       ├── 通知频率
│       ├── 汇报详细度
│       └── 纠错方式
│
├── 任务历史（Task History）
│   ├── 任务记录
│   │   ├── 任务配置
│   │   ├── 执行过程
│   │   └── 最终结果
│   ├── 效果数据
│   │   ├── 线索数/成本
│   │   ├── 转化率
│   │   └── ROI
│   └── 优化记录
│       ├── 做过的调整
│       ├── 调整效果
│       └── 最佳实践
│
├── 对话历史（Conversation History）
│   ├── 近期对话（90天）
│   └── 关键对话（永久）
│
└── 上下文窗口（Context Window）
    └── 当前会话（内存）
```

### 2.2 记忆属性对比

| 记忆类型 | 更新频率 | 存储位置 | 有效期 | 检索方式 |
|---------|---------|---------|-------|---------|
| 企业画像 | 月级 | 关系数据库 | 长期 | 精确查询 |
| 用户偏好 | 周级 | 关系数据库 | 长期 | 精确查询 |
| 任务历史 | 日级 | 时序数据库 | 2年 | 时间范围+过滤 |
| 对话历史 | 实时 | 向量数据库 | 90天 | 语义相似度 |
| 上下文窗口 | 实时 | 内存 | 会话级 | 直接访问 |

---

## 3. 记忆存储结构

### 3.1 统一记忆格式

```json
{
  "memory_id": "mem_550e8400-e29b-41d4-a716-446655440000",
  "type": "entity|preference|task|conversation|inference",
  "category": "enterprise_profile|user_style|task_config|...",
  
  "content": {
    "key": "target_markets",
    "value": ["US", "Europe", "Japan"],
    "format": "array",
    "metadata": {
      "source": "user_input",
      "context": "onboarding对话",
      "extracted_from": "msg_12345"
    }
  },
  
  "source": {
    "type": "user_input|agent_inference|system_derived|task_result",
    "confidence": 0.95,
    "verification_status": "confirmed|pending|disputed"
  },
  
  "temporal": {
    "created_at": "2024-03-15T08:30:00Z",
    "updated_at": "2024-03-20T14:22:00Z",
    "last_accessed": "2024-03-30T09:15:00Z",
    "version": 3
  },
  
  "usage": {
    "access_count": 15,
    "access_history": [
      {"time": "2024-03-30T09:15:00Z", "context": "create_task"}
    ]
  },
  
  "weight": {
    "current": 0.85,
    "base": 1.0,
    "factors": {
      "recency": 0.95,
      "frequency": 1.1,
      "confidence": 0.90
    }
  },
  
  "relations": {
    "related_memories": ["mem_xxx", "mem_yyy"],
    "derived_from": "mem_zzz",
    "superseded_by": null
  }
}
```

### 3.2 按类型的存储优化

**企业画像（PostgreSQL）**:
```sql
CREATE TABLE enterprise_profiles (
    id UUID PRIMARY KEY,
    enterprise_id UUID NOT NULL,
    product_categories JSONB,
    core_advantages JSONB,
    target_markets JSONB,
    customer_types JSONB,
    price_positioning VARCHAR,
    certifications JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version INTEGER
);
```

**对话历史（Pinecone/Milvus）**:
```python
# 向量化存储
document = {
    "id": "conv_123_msg_456",
    "text": "用户：帮我找美国户外用品批发商",
    "embedding": [0.1, 0.2, ...],  # 768维向量
    "metadata": {
        "conversation_id": "conv_123",
        "timestamp": "2024-03-30T09:00:00Z",
        "intent": "create_task",
        "user_id": "user_789"
    }
}
```

**任务历史（ClickHouse）**:
```sql
CREATE TABLE task_history (
    task_id UUID,
    user_id UUID,
    enterprise_id UUID,
    task_type String,
    config JSON,
    metrics JSON,
    created_at DateTime,
    completed_at DateTime
) ENGINE = MergeTree()
ORDER BY (enterprise_id, created_at);
```

---

## 4. 记忆权重策略

### 4.1 权重计算公式

```python
def calculate_weight(memory) -> float:
    """
    计算记忆当前权重
    """
    base_weight = get_base_weight(memory.type)
    
    # 时效性衰减（指数衰减）
    days_since_access = (now - memory.last_accessed).days
    recency_factor = math.exp(-0.01 * days_since_access)  # 半衰期约70天
    
    # 访问频率加成
    frequency_factor = 1 + math.log(memory.access_count + 1) * 0.1
    
    # 置信度调整
    confidence_factor = memory.source.confidence ** 2
    
    # 用户验证加成
    verification_multiplier = {
        "confirmed": 1.2,
        "pending": 1.0,
        "disputed": 0.5
    }[memory.source.verification_status]
    
    weight = (base_weight * 
              recency_factor * 
              frequency_factor * 
              confidence_factor * 
              verification_multiplier)
    
    return min(1.0, weight)
```

### 4.2 基础权重配置

| 记忆类型 | 基础权重 | 说明 |
|---------|---------|------|
| 企业画像 | 1.00 | 核心上下文，最高优先级 |
| 用户偏好 | 0.90 | 影响交互方式 |
| 最近任务（7天内） | 0.80 | 高时效性 |
| 历史任务（30天内） | 0.60 | 中等时效性 |
| 历史任务（>30天） | 0.40 | 低时效性 |
| 对话历史 | 0.50 | 用于语义检索 |
| Agent推断 | 0.70 | 待验证，较低权重 |

### 4.3 动态权重调整

**正向增强**:
- 用户明确引用/确认: +0.1
- 多次成功使用: +0.05/次
- 与近期高价值任务相关: +0.15

**负向衰减**:
- 长期未访问: 按公式衰减
- 用户纠正/否认: -0.3
- 版本被更新: 旧版本×0.5

---

## 5. 记忆检索与召回

### 5.1 多路召回策略

```
用户查询: "帮我找美国客户"
    │
    ├──► 精确匹配
    │       └── "target_markets" = "US" → 权重1.0
    │
    ├──► 关键词匹配
    │       └── "customer_type" contains "批发商" → 权重0.8
    │
    ├──► 语义检索（向量相似度）
    │       └── 历史对话："上次美国任务效果不错" → 相似度0.85
    │
    ├──► 关联检索
    │       └── 当前进行中的任务 → 关联度0.9
    │
    └──► 时序检索
            └── 最近创建的任务 → 时间衰减0.7
```

### 5.2 检索排序算法

```python
def retrieve_memories(query, context, top_k=5):
    # 多路召回
    candidates = []
    candidates.extend(exact_match(query))
    candidates.extend(semantic_search(query.embedding))
    candidates.extend(relation_search(context.current_task))
    candidates.extend(temporal_search(context.time_range))
    
    # 去重
    candidates = deduplicate(candidates)
    
    # 精排
    for mem in candidates:
        mem.final_score = (
            mem.weight * 0.4 +           # 记忆权重
            mem.relevance_score * 0.4 +  # 查询相关性
            mem.context_match * 0.2      # 上下文匹配度
        )
    
    # 返回Top-K
    return sorted(candidates, key=lambda x: x.final_score, reverse=True)[:top_k]
```

### 5.3 上下文组装

**系统提示词组装**:
```
[系统基础提示词]
    │
    ├──► 企业画像（完整，固定）
    │       └── "您是户外用品出口商，主营..."
    │
    ├──► 用户偏好（摘要）
    │       └── "用户偏好简洁的沟通风格..."
    │
    ├──► 相关历史任务（Top 3，摘要）
    │       ├── 美国户外用品任务（进行中）
    │       └── 欧洲电子产品任务（已完成）
    │
    ├──► 当前对话历史（最近10轮，完整）
    │       └── 完整对话记录
    │
    └──► 相关记忆片段（动态检索，Top 5）
            └── 基于当前查询检索

[组装后提示词长度控制]
- 最大token数: 4000
- 优先级: 企业画像 > 当前对话 > 相关记忆 > 历史任务 > 用户偏好
- 动态截断: 低权重记忆优先截断
```

---

## 6. 记忆更新与遗忘

### 6.1 更新触发条件

| 触发场景 | 更新方式 | 版本控制 |
|---------|---------|---------|
| 用户明确告知 | 直接更新，置信度1.0 | 新版本+历史保留 |
| Agent推断 | 标记为推断，置信度0.7 | 新版本+待确认标记 |
| 任务结果反馈 | 追加效果数据 | 追加记录 |
| 用户纠正 | 更新+提升权重+标记 | 新版本+纠正标记 |
| 系统自动推导 | 低置信度，待验证 | 草稿状态 |

### 6.2 冲突解决

**场景**: 用户之前说主营美国，现在说主营欧洲

```
新记忆: target_markets = ["Europe"] (置信度1.0，用户输入)
旧记忆: target_markets = ["US"] (置信度0.9，2个月前)

冲突检测:
├── 属性冲突: 同一属性不同值
├── 时间跨度: 2个月（合理变更周期）
└── 置信度: 新记忆更高

处理策略:
1. 保留新记忆为主要值
2. 旧记忆标记为"historical"
3. 添加"market_shift"标签
4. 记录变更历史

Agent表达:
"注意到您现在主要做欧洲市场了。
之前是美国市场（2个月前），
是否需要我调整获客策略？"
```

### 6.3 遗忘策略

**自动归档**:
```python
def should_archive(memory):
    # 权重过低且长期未访问
    if memory.weight < 0.1 and days_since_access > 30:
        return True
    
    # 被明确替代的旧版本
    if memory.superseded_by is not None and days_since_update > 90:
        return True
    
    # 临时会话记忆超期
    if memory.type == "conversation" and days_since_create > 90:
        return True
    
    return False
```

**归档处理**:
- 冷存储（低成本）
- 不再参与实时检索
- 可手动恢复
- 保留统计和分析价值

**手动删除**:
- 用户可要求删除特定记忆
- 删除需确认
- 保留删除日志

---

## 7. 记忆应用示例

### 7.1 个性化Onboarding

**新用户**:
```
Agent: "你好！我是您的数字员工团队主管。
       让我先了解一下您的企业..."
```

**回访用户**:
```
Agent: "欢迎回来！👋
       
       上次您提到想拓展欧洲市场，
       目前美国任务（户外用品）正在进行中，
       已产生23条线索。
       
       今天有什么可以帮您的？"
```

### 7.2 智能任务创建

```
用户: "再创建一个类似的任务"
    │
    ▼
[记忆检索]
├── 最近任务: 美国户外用品（画像完整）
├── 用户偏好: 喜欢快速确认，不喜过多追问
└── 历史效果: 该类画像效果良好
    │
    ▼
Agent: "好的！基于您上次的美国户外用品任务，
       我推测您想：
       
       [快速创建选项]
       [1] 相同画像，换地区（欧洲/东南亚）
       [2] 相同地区，换产品（登山装备/睡袋）
       [3] 自定义配置
       
       回复数字即可快速创建！"
```

### 7.3 风格自适应内容生成

```
[记忆检索]
├── 用户偏好: "沟通风格 = 简洁直接"
├── 历史反馈: 用户对冗长内容表示不满
└── 成功案例: 某简洁版本获得好评
    │
    ▼
[内容生成时调整]
├── 控制字数: 目标800字（而非默认1200）
├── 减少寒暄: 去掉"很高兴联系您"等
├── 突出要点: 使用 bullet points
└── 直接CTA: 明确的下一步行动
```

---

## 8. 隐私与安全

### 8.1 数据分类与保护

| 数据级别 | 内容 | 保护措施 |
|---------|------|---------|
| 公开 | 企业名称、行业 | 标准加密 |
| 内部 | 联系方式、采购数据 | 加密+访问控制 |
| 敏感 | 客户列表、邮件内容 | 加密+审计日志 |
| 机密 | API密钥、密码 | 硬件安全模块 |

### 8.2 用户数据权利

- **查看权**: 用户可查看所有存储的记忆
- **修改权**: 用户可纠正错误记忆
- **删除权**: 用户可要求删除特定记忆
- **导出权**: 用户可导出所有数据
- **遗忘权**: 用户可要求完全清除账户数据

---

## 9. 监控与优化

### 9.1 记忆系统指标

| 指标 | 目标值 | 监控方式 |
|-----|-------|---------|
| 记忆检索命中率 | >80% | 检索日志 |
| 平均检索延迟 | <200ms | 性能监控 |
| 记忆更新频率 | 合理范围 | 更新日志 |
| 冷存储比例 | <30% | 存储分析 |
| 用户纠正率 | <10% | 反馈统计 |

### 9.2 记忆质量评估

```
记忆质量评分:
├── 准确性: 与事实一致程度（用户反馈）
├── 时效性: 信息是否仍然有效
├── 有用性: 被检索和使用的频率
└── 完整性: 关键信息是否齐全
```

---

## 10. 自检清单

### 记忆系统设计完成标准

- [x] 定义了完整的记忆类型体系
- [x] 每种记忆类型有明确的存储结构和位置
- [x] 权重计算公式包含时效性、频率、置信度
- [x] 检索策略支持多路召回和精排
- [x] 上下文组装有优先级和长度控制
- [x] 记忆更新有版本控制和冲突解决
- [x] 遗忘策略有自动归档和手动删除
- [x] 隐私保护覆盖所有数据级别

### 应用场景验证

1. **Agent能记住用户是谁吗？**
   - ✅ 企业画像完整保留
   - ✅ 用户偏好持续学习
   - ✅ 历史任务可追溯

2. **Agent能避免重复询问吗？**
   - ✅ 已收集信息自动填充
   - ✅ 相似任务智能推荐
   - ✅ 上下文连续继承

3. **Agent能从错误中学习吗？**
   - ✅ 用户纠正更新记忆
   - ✅ 错误模式被记录避免
   - ✅ 偏好被持续优化
