# DealClaw 设计系统

## 颜色系统

### 主色
| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary` | `#0F172A` | 主色调，导航栏、重要标题 |
| `--color-secondary` | `#334155` | 次要文字、辅助元素 |
| `--color-accent` | `#0369A1` | CTA按钮、强调元素、链接 |
| `--color-accent-hover` | `#0284C7` | CTA悬停状态 |

### 背景色
| Token | 值 | 用途 |
|-------|-----|------|
| `--color-bg-primary` | `#F8FAFC` | 页面主背景 |
| `--color-bg-secondary` | `#FFFFFF` | 卡片背景、浮层 |
| `--color-bg-tertiary` | `#F1F5F9` | 输入框背景、分隔区域 |

### 文字色
| Token | 值 | 用途 |
|-------|-----|------|
| `--color-text-primary` | `#020617` | 主要文字 |
| `--color-text-secondary` | `#475569` | 次要文字、描述 |
| `--color-text-tertiary` | `#94A3B8` | 占位符、禁用状态 |

### 状态色
| Token | 值 | 用途 |
|-------|-----|------|
| `--color-success` | `#10B981` | 成功状态 |
| `--color-warning` | `#F59E0B` | 警告状态 |
| `--color-error` | `#EF4444` | 错误状态 |
| `--color-info` | `#3B82F6` | 信息提示 |

### 优先级标签色
| 优先级 | 背景色 | 文字色 |
|-------|-------|-------|
| P0 | `#FEE2E2` | `#DC2626` |
| P1 | `#FEF3C7` | `#D97706` |
| P2 | `#D1FAE5` | `#059669` |

### 线索评分色
| 评分等级 | 颜色 |
|---------|-----|
| 热门(90-100) | `#EF4444` 🔥 |
| 高意向(70-89) | `#F59E0B` ⚡ |
| 中意向(50-69) | `#3B82F6` 💡 |
| 低意向(<50) | `#94A3B8` 📌 |

## 字体系统

### 字体族
- **主字体**: Plus Jakarta Sans
- **备用字体**: system-ui, -apple-system, sans-serif

### 字号规范
| 层级 | 大小 | 字重 | 行高 | 用途 |
|-----|------|-----|------|-----|
| H1 | 32px | 700 | 1.2 | 页面主标题 |
| H2 | 24px | 600 | 1.3 | 区块标题 |
| H3 | 20px | 600 | 1.4 | 卡片标题 |
| H4 | 16px | 600 | 1.5 | 小标题 |
| Body | 14px | 400 | 1.6 | 正文 |
| Small | 12px | 400 | 1.5 | 辅助文字 |
| Caption | 11px | 500 | 1.4 | 标签、徽章 |

## 间距系统

### 基础单位: 4px
| Token | 值 |
|-------|-----|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

### 布局间距
- 页面内边距: 24px (桌面), 16px (移动)
- 卡片间距: 16px
- 卡片内边距: 20px
- 表单字段间距: 16px

## 圆角系统
| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 4px | 小按钮、标签 |
| `--radius-md` | 8px | 按钮、输入框 |
| `--radius-lg` | 12px | 卡片、弹窗 |
| `--radius-xl` | 16px | 大卡片、模态框 |

## 阴影系统
| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 小元素 |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | 卡片、下拉 |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | 弹窗、浮层 |

## 组件规范

### 按钮
| 类型 | 背景 | 文字 | 边框 | 圆角 | 内边距 |
|-----|------|-----|------|-----|-------|
| Primary | `#0369A1` | `#FFFFFF` | none | 8px | 12px 20px |
| Secondary | `#FFFFFF` | `#334155` | `#E2E8F0` | 8px | 12px 20px |
| Ghost | transparent | `#0369A1` | none | 8px | 12px 20px |
| Danger | `#EF4444` | `#FFFFFF` | none | 8px | 12px 20px |

### 输入框
- 高度: 40px
- 内边距: 12px 16px
- 边框: 1px solid `#E2E8F0`
- 圆角: 8px
- 聚焦边框: `#0369A1`
- 占位符颜色: `#94A3B8`

### 卡片
- 背景: `#FFFFFF`
- 边框: 1px solid `#E2E8F0`
- 圆角: 12px
- 内边距: 20px
- 阴影: `--shadow-sm`

### 标签/徽章
- 内边距: 4px 10px
- 圆角: 4px
- 字号: 11px
- 字重: 500

## 动画规范
- 默认过渡: `150ms ease`
- 按钮悬停: `150ms ease`
- 弹窗出现: `200ms cubic-bezier(0.4, 0, 0.2, 1)`
- 页面切换: `300ms ease-in-out`
