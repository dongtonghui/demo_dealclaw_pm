# DealClaw PRD V3.0 - 功能流程图与数据流（Mermaid）

> 文档用途: 详细功能逻辑流程图、数据流程图、时序图
> 使用Mermaid语法绘制，可直接渲染为图表

---

## 1. 系统架构图

### 1.1 整体系统架构

```mermaid
graph TB
    subgraph 用户层
        U1[外贸企业主]
        U2[外贸业务员]
        U3[运营人员]
    end

    subgraph 接入层
        GW[API Gateway<br/>Kong/Nginx]
        WAF[WAF/DDoS防护]
        CDN[Cloudflare CDN]
    end

    subgraph 服务层
        subgraph 对话核心服务
            IC[意图识别服务]
            EE[实体提取服务]
            CM[上下文管理服务]
            RG[回复生成服务]
        end
        
        subgraph Agent调度中心
            AR[Agent注册表]
            TO[任务编排器]
            RA[结果聚合器]
        end
        
        subgraph Agent服务集群
            SA[SEO Agent]
            EA[Email Agent]
            WA[WhatsApp Agent]
            DA[数据Agent]
            LA[线索Agent]
        end
        
        subgraph 业务支撑服务
            US[用户中心]
            TS[任务中心]
            LS[线索中心]
            AN[分析服务]
        end
    end

    subgraph 数据层
        PG[(PostgreSQL<br/>主数据)]
        MG[(MongoDB<br/>对话/内容)]
        CH[(ClickHouse<br/>海关数据)]
        ES[(Elasticsearch<br/>搜索)]
        RD[(Redis<br/>缓存)]
        OS[(MinIO/OSS<br/>对象存储)]
    end

    subgraph 外部集成
        LLM[Kimi/DeepSeek<br/>Claude/GPT-4]
        EMAIL[SendGrid/SES<br/>邮件服务]
        WP[WordPress<br/>Shopify]
        WHATSAPP[WhatsApp<br/>Cloud API]
        DATA[海关数据商<br/>企业数据库]
    end

    U1 & U2 & U3 --> CDN
    CDN --> WAF --> GW
    
    GW --> IC & EE & CM & RG
    CM --> AR
    AR --> TO
    TO --> SA & EA & WA & DA & LA
    SA & EA & WA & DA & LA --> RA
    RA --> RG
    
    RG --> US & TS & LS & AN
    
    US --> PG & RD
    TS --> PG & MG
    LS --> PG & ES
    AN --> CH & PG
    
    SA -.->|内容发布| WP
    EA -.->|邮件发送| EMAIL
    WA -.->|消息推送| WHATSAPP
    DA -.->|数据获取| DATA
    IC & EE & RG -.->|AI能力| LLM
    
    MG --> OS
```

---

## 2. 核心业务流程图

### 2.1 获客任务完整生命周期

```mermaid
flowchart TD
    Start([用户输入<br/>获客目标]) --> Intent[意图识别服务<br/>解析目标画像]
    
    Intent --> Knowledge[查询企业知识库<br/>补充上下文]
    
    Knowledge --> Missing{信息<br/>是否完整?}
    Missing -->|否| Ask[追问缺失信息<br/>采购规模/时间预期]
    Ask --> UserInput[用户回答]
    UserInput --> Profile[生成客户画像]
    
    Missing -->|是| Profile
    
    Profile --> Confirm[展示画像确认卡片<br/>用户确认/编辑]
    Confirm --> TaskSplit[任务拆解]
    
    TaskSplit --> Parallel{并行执行}
    Parallel --> Task1[SEO Agent<br/>生成内容策略]
    Parallel --> Task2[Email Agent<br/>筛选目标客户]
    Parallel --> Task3[WhatsApp Agent<br/>备选配置]
    
    Task1 --> Collect1[返回SEO策略<br/>关键词/内容计划]
    Task2 --> Collect2[返回邮件策略<br/>客户列表/发送计划]
    Task3 --> Collect3[返回WhatsApp配置]
    
    Collect1 & Collect2 & Collect3 --> Aggregate[结果聚合<br/>生成获客方案卡片]
    
    Aggregate --> ShowPlan[展示获客方案<br/>预期效果/成本]
    ShowPlan --> Execute{用户确认?}
    
    Execute -->|确认| StartTask[启动获客任务]
    Execute -->|调整| Adjust[调整配置] --> TaskSplit
    
    StartTask --> Monitor[执行监控中心<br/>各Agent状态追踪]
    
    Monitor --> LeadGen[线索生成]
    LeadGen --> Score[AI意向评分]
    Score --> Push[高意向线索推送]
    Push --> End1([用户跟进])
    
    Monitor --> Report[定时效果报告]
    Report --> Optimize[策略优化建议]
    Optimize --> Monitor
```

### 2.2 主管Agent协调逻辑

```mermaid
sequenceDiagram
    autonumber
    actor User as 用户
    participant MA as 主管Agent
    participant IC as 意图识别
    participant KB as 知识库
    participant TO as 任务编排器
    participant SA as SEO Agent
    participant EA as Email Agent
    participant RA as 结果聚合器

    User->>MA: "帮我找美国户外用品批发商"
    
    MA->>IC: 意图识别请求
    IC-->>MA: {intent: create_task,<br/>entities: {...}}
    
    MA->>KB: 查询企业知识库
    KB-->>MA: 企业画像数据
    
    MA->>MA: 判断信息完整性
    
    alt 信息不完整
        MA->>User: 追问缺失信息<br/>"目标客户年采购额?"
        User->>MA: 回答追问
    end
    
    MA->>User: 展示画像确认卡片
    User->>MA: 确认画像
    
    MA->>TO: 提交任务拆解请求
    
    par 并行执行任务
        TO->>SA: 分配SEO任务
        SA-->>TO: 返回SEO策略
    and
        TO->>EA: 分配Email任务
        EA-->>TO: 返回邮件策略
    end
    
    TO->>RA: 提交结果聚合
    RA-->>MA: 完整获客方案
    
    MA->>User: 展示获客方案卡片
    User->>MA: 确认执行
    
    MA->>TO: 启动任务执行
    
    loop 定时汇报
        MA->>User: 推送任务进度
    end
    
    opt 高意向线索产生
        MA->>User: 立即推送线索卡片
    end
```

---

## 3. 数据流程图

### 3.1 线索数据全生命周期

```mermaid
flowchart LR
    subgraph 线索捕获
        C1[SEO询盘]
        C2[邮件回复]
        C3[LinkedIn互动]
        C4[WhatsApp咨询]
    end
    
    subgraph 线索处理
        Collect[线索聚合服务]
        Enrich[数据 enrichment<br/>企业信息补全]
        Score[AI意向评分引擎]
        Tag[标签分类<br/>行业/意向/优先级]
    end
    
    subgraph 线索存储
        PG[(PostgreSQL<br/>线索主表)]
        ES[(Elasticsearch<br/>线索搜索)]
        RD[(Redis<br/>热点线索)]
    end
    
    subgraph 线索分发
        Push[实时推送服务<br/>WebSocket]
        Assign[线索分配<br/>轮询/负载]
        Notify[通知提醒<br/>邮件/站内信]
    end
    
    subgraph 线索跟进
        Track[跟进状态追踪]
        Convert[转化标记]
        Archive[归档/回收]
    end
    
    C1 & C2 & C3 & C4 --> Collect
    Collect --> Enrich --> Score --> Tag
    
    Tag --> PG
    PG --> ES
    PG --> RD
    
    RD --> Push
    PG --> Assign
    Assign --> Notify
    
    Push & Assign --> Track
    Track --> Convert
    Convert --> Archive
    
    Archive -.->|超期未跟进| Collect
```

### 3.2 内容发布数据流（SEO Agent）

```mermaid
flowchart TD
    Start([内容策略制定]) --> Keywords[关键词分析]
    
    Keywords --> Generate[AI内容生成]
    Generate --> Quality[质量检测]
    
    Quality --> Check1{原创度<br/>>90%?}
    Check1 -->|否| Rewrite[重写优化]
    Rewrite --> Generate
    
    Check1 -->|是| Check2{AI痕迹<br/><70%?}
    Check2 -->|否| HumanEdit[人工改写]
    HumanEdit --> Quality
    
    Check2 -->|是| Check3{可读性<br/>score>50?}
    Check3 -->|否| Optimize[语言优化]
    Optimize --> Quality
    
    Check3 -->|是| Review[人工抽查<br/>10%抽样]
    
    Review --> Approve{审核通过?}
    Approve -->|否| Edit[编辑修改]
    Edit --> Quality
    
    Approve -->|是| Queue[进入发布队列]
    Queue --> Schedule[发布排期]
    
    Schedule --> Publish[发布到站点]
    Publish --> WP[WordPress/Shopify]
    
    WP --> Index[搜索引擎索引]
    Index --> Monitor[排名监控]
    
    Monitor --> Alert{排名异常?}
    Alert -->|是| Pause[暂停发布]
    Pause --> Diagnose[诊断分析]
    
    Alert -->|否| Report[效果报告]
    Report --> Optimize2[策略优化]
    Optimize2 --> Keywords
```

### 3.3 邮件发送数据流（Email Agent）

```mermaid
flowchart TD
    subgraph 客户筛选
        A1[企业库检索<br/>3亿+企业]
        A2[海关数据匹配<br/>进口记录筛选]
        A3[决策人挖掘<br/>邮箱/电话]
        A4[画像匹配<br/>行业/规模/地区]
    end
    
    subgraph 内容生成
        B1[个性化邮件生成]
        B2[多语言模板]
        B3[A/B测试版本]
    end
    
    subgraph 发送控制
        C1[发送策略引擎]
        C2[信誉预热<br/>冷启动/成长期/成熟期]
        C3[频率控制<br/>10→500封/天]
        C4[时段优化<br/>当地时间9-11点]
    end
    
    subgraph 发送执行
        D1[自有邮箱<br/>SMTP/OAuth]
        D2[平台代发<br/>95%+送达率]
        D3[专业服务商<br/>SendGrid/SES]
    end
    
    subgraph 反馈处理
        E1[送达追踪]
        E2[打开追踪]
        E3[回复监控]
        E4[退信处理]
    end
    
    subgraph 线索识别
        F1[回复内容分析]
        F2[意向评分<br/>1-100分]
        F3[高意向推送]
    end
    
    A1 & A2 & A3 & A4 --> B1
    B1 --> B2 --> B3
    B3 --> C1
    C1 --> C2 --> C3 --> C4
    
    C4 --> D1 & D2 & D3
    D1 & D2 & D3 --> E1
    E1 --> E2 --> E3 --> E4
    
    E3 & E4 --> F1
    F1 --> F2 --> F3
```

---

## 4. 状态机图

### 4.1 获客任务状态机

```mermaid
stateDiagram-v2
    [*] --> 待启动: 创建任务
    
    待启动 --> 执行中: 用户确认执行
    待启动 --> 已取消: 用户取消
    
    执行中 --> 执行中: Agent持续工作
    执行中 --> 已暂停: 用户暂停
    执行中 --> 已完成: 达到目标/到期
    执行中 --> 异常: Agent错误
    
    已暂停 --> 执行中: 用户恢复
    已暂停 --> 已取消: 用户取消
    
    异常 --> 执行中: 自动重试/恢复
    异常 --> 已暂停: 需人工介入
    
    已完成 --> [*]
    已取消 --> [*]
```

### 4.2 线索状态机

```mermaid
stateDiagram-v2
    [*] --> 新线索: 系统自动捕获
    
    新线索 --> 待分配: AI评分完成
    
    待分配 --> 待跟进: 分配给销售
    待分配 --> 回收池: 超时未分配
    
    待跟进 --> 跟进中: 销售开始跟进
    待跟进 --> 无效线索: 初步筛选不通过
    
    跟进中 --> 高意向: 客户回复询价
    跟进中 --> 培育中: 需长期培育
    跟进中 --> 无效线索: 明确拒绝
    
    高意向 --> 已成交: 完成订单
    高意向 --> 跟进中: 需持续跟进
    
    培育中 --> 高意向: 意向提升
    培育中 --> 无效线索: 长期无响应
    
    回收池 --> 待分配: 重新激活
    
    无效线索 --> [*]
    已成交 --> [*]
```

---

## 5. 时序图

### 5.1 用户创建获客任务时序

```mermaid
sequenceDiagram
    autonumber
    participant User as 用户
    participant FE as 前端WebApp
    participant API as API Gateway
    participant MA as 主管Agent服务
    participant IC as 意图识别服务
    participant KB as 知识库服务
    participant TO as 任务编排服务
    participant SA as SEO Agent
    participant EA as Email Agent
    participant DB as PostgreSQL
    participant MQ as 消息队列
    participant WS as WebSocket服务

    User->>FE: 输入："帮我找美国户外用品批发商"
    FE->>API: POST /api/v1/conversation/message
    API->>MA: 转发请求
    
    MA->>IC: 意图识别
    IC-->>MA: 返回：create_task, entities
    
    MA->>KB: 获取企业知识库
    KB->>DB: SELECT company_profile
    DB-->>KB: 企业画像数据
    KB-->>MA: 返回上下文
    
    MA->>MA: 分析信息完整性
    
    alt 信息不完整
        MA->>API: 返回追问
        API->>FE: 展示追问
        FE->>User: "目标客户年采购额?"
        User->>FE: 回答
        FE->>API: POST 回答
        API->>MA: 更新上下文
    end
    
    MA->>DB: 保存临时画像
    MA->>API: 返回画像卡片
    API->>FE: 渲染卡片
    FE->>User: 展示画像确认卡片
    
    User->>FE: 确认画像
    FE->>API: POST /confirm-profile
    API->>MA: 确认请求
    
    MA->>TO: 提交任务拆解
    TO->>MQ: 发布SEO任务
    TO->>MQ: 发布Email任务
    
    par SEO Agent处理
        MQ->>SA: 消费任务
        SA->>SA: 关键词分析
        SA->>SA: 生成内容策略
        SA->>MQ: 返回结果
    and Email Agent处理
        MQ->>EA: 消费任务
        EA->>EA: 企业库筛选
        EA->>EA: 生成邮件策略
        EA->>MQ: 返回结果
    end
    
    MQ->>TO: 收集结果
    TO->>MA: 完整方案
    
    MA->>DB: 保存获客方案
    MA->>API: 返回方案卡片
    API->>FE: 渲染方案
    FE->>User: 展示获客方案
    
    User->>FE: 确认执行
    FE->>API: POST /execute-task
    API->>MA: 启动任务
    
    MA->>DB: 更新任务状态
    MA->>MQ: 发布执行指令
    MA->>WS: 推送启动通知
    WS->>FE: WebSocket推送
    FE->>User: 显示执行状态
```

### 5.2 线索实时推送时序

```mermaid
sequenceDiagram
    autonumber
    participant Email as 邮件服务
    participant EA as Email Agent
    participant Score as 评分服务
    participant LS as 线索中心
    participant PG as PostgreSQL
    participant RD as Redis
    participant WS as WebSocket
    participant FE as 前端
    participant User as 用户

    Email->>EA: 收到客户回复
    EA->>EA: 解析回复内容
    
    EA->>Score: 请求意向评分
    Score->>Score: AI分析内容<br/>行为评分
    Score-->>EA: 返回评分：92分
    
    alt 高意向线索(>80分)
        EA->>LS: 创建线索
        LS->>PG: INSERT lead
        LS->>RD: 缓存热点线索
        
        LS->>WS: 实时推送
        WS->>FE: WebSocket消息
        FE->>User: 弹窗通知<br/>🔔 高意向线索
        
        FE->>LS: 获取线索详情
        LS->>PG: SELECT lead_details
        PG-->>LS: 线索数据
        LS-->>FE: 线索详情
        FE->>User: 展示线索卡片
    else 中低意向线索
        EA->>LS: 批量创建
        LS->>PG: INSERT leads
    end
```

### 5.3 内容发布流程时序

```mermaid
sequenceDiagram
    autonumber
    participant User as 用户
    participant SA as SEO Agent
    participant LLM as LLM服务
    participant QC as 质量检测
    participant DB as 数据库
    participant Queue as 发布队列
    participant WP as WordPress
    participant Search as 搜索引擎

    User->>SA: 请求生成SEO文章
    SA->>SA: 关键词分析
    
    SA->>LLM: 生成文章请求
    LLM-->>SA: 返回文章内容
    
    SA->>QC: 质量检测
    
    loop 质量检查
        QC->>QC: 原创度检测
        QC->>QC: AI痕迹检测
        QC->>QC: 可读性评分
    end
    
    alt 检测通过
        QC-->>SA: 通过
    else 检测不通过
        QC-->>SA: 不通过原因
        SA->>LLM: 重写请求
        LLM-->>SA: 优化内容
        SA->>QC: 重新检测
    end
    
    SA->>User: 展示文章预览
    User->>SA: 确认发布
    
    SA->>DB: 保存文章
    SA->>Queue: 加入发布队列
    
    Queue->>WP: 定时发布
    WP-->>Queue: 发布成功
    
    Queue->>SA: 发布完成
    Search->>WP: 爬虫索引
    WP-->>Search: 返回内容
    
    Search->>SA: 索引通知
    SA->>DB: 更新文章状态
    SA->>User: 发布成功通知
```

---

## 6. 领域模型图

### 6.1 核心业务实体关系

```mermaid
erDiagram
    USER ||--o{ COMPANY : owns
    USER ||--o{ TEAM : belongs_to
    USER ||--o{ LEAD_TASK : creates
    
    COMPANY ||--o{ COMPANY_PROFILE : has
    COMPANY ||--o{ LEAD_TASK : submits
    COMPANY ||--|| SEO_CONFIG : configures
    COMPANY ||--|| EMAIL_CONFIG : configures
    
    LEAD_TASK ||--o{ LEAD : generates
    LEAD_TASK ||--o{ TASK_EXECUTION : has
    LEAD_TASK ||--o{ CAMPAIGN : contains
    
    CAMPAIGN ||--|{ EMAIL_CAMPAIGN : type
    CAMPAIGN ||--|{ SEO_CAMPAIGN : type
    
    EMAIL_CAMPAIGN ||--o{ EMAIL_SENT : tracks
    EMAIL_CAMPAIGN ||--o{ TARGET_CUSTOMER : targets
    
    SEO_CAMPAIGN ||--o{ ARTICLE : publishes
    SEO_CAMPAIGN ||--o{ KEYWORD : targets
    
    LEAD ||--o{ LEAD_INTERACTION : has
    LEAD ||--o{ LEAD_ASSIGNMENT : assigns
    LEAD ||--|| LEAD_SCORE : calculated
    
    LEAD_ASSIGNMENT ||--o{ FOLLOW_UP : tracks
    
    AGENT ||--o{ TASK_EXECUTION : executes
    AGENT ||--o{ AGENT_CAPABILITY : has
    
    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION ||--|| LEAD_TASK : related_to
    
    USER {
        uuid id PK
        string email
        string name
        enum role
        datetime created_at
    }
    
    COMPANY {
        uuid id PK
        string name
        string industry
        string website
        uuid owner_id FK
    }
    
    COMPANY_PROFILE {
        uuid id PK
        uuid company_id FK
        jsonb products
        jsonb advantages
        jsonb target_markets
        jsonb customer_types
    }
    
    LEAD_TASK {
        uuid id PK
        uuid company_id FK
        uuid creator_id FK
        string title
        jsonb target_profile
        enum status
        datetime start_date
        datetime end_date
    }
    
    LEAD {
        uuid id PK
        uuid task_id FK
        string source
        string company_name
        string contact_name
        string email
        string phone
        int score
        enum status
    }
    
    LEAD_SCORE {
        uuid lead_id PK
        int overall_score
        jsonb dimension_scores
        string reasoning
    }
    
    CAMPAIGN {
        uuid id PK
        uuid task_id FK
        enum type
        enum status
        jsonb config
    }
    
    ARTICLE {
        uuid id PK
        uuid campaign_id FK
        string title
        text content
        string slug
        enum status
        datetime published_at
    }
    
    AGENT {
        uuid id PK
        string name
        enum type
        jsonb capabilities
        enum status
    }
    
    CONVERSATION {
        uuid id PK
        uuid user_id FK
        uuid task_id FK
        enum type
    }
    
    MESSAGE {
        uuid id PK
        uuid conversation_id FK
        enum role
        text content
        jsonb cards
        datetime timestamp
    }
```

---

## 7. 部署架构图

### 7.1 Kubernetes部署拓扑

```mermaid
graph TB
    subgraph 阿里云ACK主集群
        subgraph Ingress层
            IC1[Nginx Ingress<br/>Controller]
            IC2[Nginx Ingress<br/>Controller]
        end
        
        subgraph 应用服务
            subgraph Pod1[对话服务]
                C1[Container<br/>Conversation]
            end
            subgraph Pod2[Agent服务]
                A1[Container<br/>SEO Agent]
                A2[Container<br/>Email Agent]
            end
            subgraph Pod3[业务服务]
                B1[Container<br/>线索中心]
                B2[Container<br/>用户中心]
            end
        end
        
        subgraph 数据服务
            PG1[(PostgreSQL<br/>Primary)]
            PG2[(PostgreSQL<br/>Replica)]
            MG1[(MongoDB<br/>Primary)]
            RD1[(Redis<br/>Master)]
        end
    end
    
    subgraph 腾讯云TKE备集群
        subgraph Ingress层2
            IC3[Nginx Ingress]
        end
        
        subgraph 应用服务2
            C3[对话服务]
            A3[Agent服务]
        end
        
        subgraph 数据服务2
            PG3[(PostgreSQL<br/>Replica)]
            RD2[(Redis<br/>Replica)]
        end
    end
    
    subgraph 外部服务
        CF[Cloudflare<br/>CDN/WAF]
        DNS[DNS<br/>负载均衡]
    end
    
    CF --> DNS
    DNS -->|主| IC1 & IC2
    DNS -->|备| IC3
    
    IC1 & IC2 --> C1
    IC1 & IC2 --> A1 & A2
    IC1 & IC2 --> B1 & B2
    
    C1 -.-> PG1 & RD1
    A1 & A2 -.-> PG1 & MG1
    B1 & B2 -.-> PG1 & MG1
    
    PG1 -.->|主从复制| PG2
    PG1 -.->|跨区域复制| PG3
```

---

## 8. 监控告警架构

```mermaid
flowchart LR
    subgraph 数据采集
        APP[应用指标<br/>Prometheus SDK]
        INF[基础设施<br/>Node Exporter]
        DB[数据库<br/>Exporter]
    end
    
    subgraph 时序数据库
        TSDB[(Prometheus<br/>TSDB)]
    end
    
    subgraph 告警处理
        Alert[AlertManager]
        Rule[告警规则引擎]
    end
    
    subgraph 通知渠道
        WX[企业微信]
        Mail[邮件]
        SMS[短信]
        Phone[电话]
    end
    
    subgraph 可视化
        Grafana[Grafana<br/>Dashboard]
    end
    
    APP & INF & DB -->|Pull| TSDB
    TSDB --> Rule
    Rule --> Alert
    Alert --> WX & Mail & SMS & Phone
    TSDB --> Grafana
    
    subgraph 关键告警规则
        R1[API响应时间>3s<br/>P1]
        R2[错误率>1%<br/>P1]
        R3[数据库连接池>80%<br/>P2]
        R4[磁盘使用率>85%<br/>P2]
        R5[内存使用率>90%<br/>P1]
    end
    
    Rule -.-> R1 & R2 & R3 & R4 & R5
```

---

*文档说明：本文档使用Mermaid语法绘制，可在支持Mermaid的Markdown编辑器或GitHub/GitLab中直接渲染为图表*
