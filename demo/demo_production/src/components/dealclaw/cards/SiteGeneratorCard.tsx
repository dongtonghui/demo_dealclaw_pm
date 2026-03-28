import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";
import { Globe, Palette, Layout, Check, Sparkles, ArrowRight, Loader2, FileText, Image, Settings, Eye } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

type TemplateType = "modern" | "classic" | "minimal" | "bold";
type ColorScheme = "blue" | "green" | "purple" | "orange" | "dark";

interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
}

export function SiteGeneratorCard({ card, onAction }: Props) {
  const { companyProfile } = card.data;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [config, setConfig] = useState({
    template: "modern" as TemplateType,
    colorScheme: "blue" as ColorScheme,
    pages: ["home", "about", "products", "blog", "contact"],
    includeBlog: true,
    includeChatbot: true,
    seoOptimized: true,
    mobileFirst: true,
    siteName: companyProfile?.name || "",
    tagline: companyProfile?.slogan || "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationStep[]>([
    { id: "structure", label: "生成站点结构", status: "pending" },
    { id: "content", label: "生成页面内容", status: "pending" },
    { id: "seo", label: "优化SEO设置", status: "pending" },
    { id: "assets", label: "生成设计资源", status: "pending" },
    { id: "deploy", label: "准备部署", status: "pending" },
  ]);
  const [previewMode, setPreviewMode] = useState(false);

  const templates: { id: TemplateType; name: string; icon: string; description: string }[] = [
    { id: "modern", name: "现代商务", icon: "🏢", description: "简洁现代，适合B2B企业" },
    { id: "classic", name: "经典专业", icon: "🎩", description: "传统稳重，适合服务业" },
    { id: "minimal", name: "极简风格", icon: "✨", description: "极简设计，突出内容" },
    { id: "bold", name: "大胆创意", icon: "🎨", description: "视觉冲击，适合创意行业" },
  ];

  const colorSchemes: { id: ColorScheme; name: string; colors: string[] }[] = [
    { id: "blue", name: "商务蓝", colors: ["#0066FF", "#4D94FF", "#E6F0FF"] },
    { id: "green", name: "自然绿", colors: ["#10B981", "#34D399", "#D1FAE5"] },
    { id: "purple", name: "科技紫", colors: ["#8B5CF6", "#A78BFA", "#EDE9FE"] },
    { id: "orange", name: "活力橙", colors: ["#F97316", "#FB923C", "#FFEDD5"] },
    { id: "dark", name: "深色模式", colors: ["#1F2937", "#374151", "#4B5563"] },
  ];

  const pageOptions = [
    { id: "home", label: "首页", icon: "🏠" },
    { id: "about", label: "关于我们", icon: "ℹ️" },
    { id: "products", label: "产品/服务", icon: "📦" },
    { id: "blog", label: "博客", icon: "📝" },
    { id: "contact", label: "联系我们", icon: "📞" },
    { id: "faq", label: "常见问题", icon: "❓" },
    { id: "testimonials", label: "客户评价", icon: "⭐" },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep(3);

    // 模拟生成过程
    for (let i = 0; i < generationProgress.length; i++) {
      setGenerationProgress(prev =>
        prev.map((p, idx) =>
          idx === i ? { ...p, status: "active" } :
          idx < i ? { ...p, status: "completed" } : p
        )
      );
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGenerationProgress(prev =>
        prev.map((p, idx) =>
          idx === i ? { ...p, status: "completed" } : p
        )
      );
    }

    setTimeout(() => {
      setPreviewMode(true);
      setIsGenerating(false);
      onAction("site-generated", { config });
    }, 500);
  };

  const togglePage = (pageId: string) => {
    setConfig(prev => ({
      ...prev,
      pages: prev.pages.includes(pageId)
        ? prev.pages.filter(p => p !== pageId)
        : [...prev.pages, pageId],
    }));
  };

  if (previewMode) {
    return (
      <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-2xl">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎉</span>
            <span className="text-sm font-medium text-foreground">独立站生成完成!</span>
          </div>
          <p className="text-xs text-muted-foreground">
            您的{templates.find(t => t.id === config.template)?.name}风格独立站已准备就绪
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="h-8 bg-muted flex items-center px-3 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="h-4 bg-background rounded text-[10px] text-center text-muted-foreground flex items-center justify-center">
                  https://{config.siteName.toLowerCase().replace(/\s+/g, "-")}.com
                </div>
              </div>
            </div>
            <div className="h-48 bg-gradient-to-br from-background to-muted p-4">
              <div className="h-full flex flex-col">
                {/* Mock Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold" style={{ color: colorSchemes.find(c => c.id === config.colorScheme)?.colors[0] }}>
                    {config.siteName}
                  </div>
                  <div className="flex gap-3">
                    {config.pages.slice(0, 4).map(p => (
                      <div key={p} className="w-8 h-3 bg-muted rounded" />
                    ))}
                  </div>
                </div>
                {/* Mock Hero */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground mb-2">{config.tagline || "Welcome"}</div>
                    <div className="w-32 h-8 rounded-lg mx-auto" style={{ backgroundColor: colorSchemes.find(c => c.id === config.colorScheme)?.colors[0] }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-3">
              <div className="text-[10px] text-muted-foreground mb-1">包含页面</div>
              <div className="text-sm font-medium">{config.pages.length} 个页面</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-[10px] text-muted-foreground mb-1">SEO优化</div>
              <div className="text-sm font-medium">{config.seoOptimized ? "✓ 已启用" : "未启用"}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-[10px] text-muted-foreground mb-1">响应式设计</div>
              <div className="text-sm font-medium">{config.mobileFirst ? "✓ 已优化" : "标准"}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-[10px] text-muted-foreground mb-1">AI客服</div>
              <div className="text-sm font-medium">{config.includeChatbot ? "✓ 已集成" : "未集成"}</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border flex gap-2">
          <button
            onClick={() => onAction("deploy-site", { config })}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Globe className="w-4 h-4" />
            一键部署
          </button>
          <button
            onClick={() => onAction("download-source", { config })}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-agent-seo text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <FileText className="w-4 h-4" />
            下载源码
          </button>
          <button
            onClick={() => {
              setPreviewMode(false);
              setStep(1);
              setGenerationProgress(prev => prev.map(p => ({ ...p, status: "pending" })));
            }}
            className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
          >
            重新配置
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🚀</span>
          <span className="text-sm font-medium text-foreground">一键生成独立站</span>
        </div>
        <p className="text-xs text-muted-foreground">
          基于您的公司信息，AI将自动生成完整的营销独立站
        </p>
      </div>

      {/* Step Indicator */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-center gap-2">
          {[
            { id: 1, label: "选择模板" },
            { id: 2, label: "配置页面" },
            { id: 3, label: "生成站点" },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                step >= s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              <span className={`text-xs ml-1.5 ${step >= s.id ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < 2 && <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {step === 1 && (
          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Layout className="w-3.5 h-3.5" />
                选择网站模板
              </label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setConfig({ ...config, template: template.id })}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      config.template === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <div className="text-xs font-medium text-foreground">{template.name}</div>
                    <div className="text-[10px] text-muted-foreground">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                配色方案
              </label>
              <div className="flex gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setConfig({ ...config, colorScheme: scheme.id })}
                    className={`flex-1 p-2 border rounded-lg transition-all ${
                      config.colorScheme === scheme.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex gap-0.5 mb-1.5">
                      {scheme.colors.map((color, i) => (
                        <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="text-[10px] text-center">{scheme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Site Info */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">站点名称</label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="您的公司名称"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">标语/Slogan</label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="简短的标语"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Page Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                选择页面 ({config.pages.length} 个已选)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {pageOptions.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => togglePage(page.id)}
                    className={`flex items-center gap-2 p-2 border rounded-lg text-left transition-all ${
                      config.pages.includes(page.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 opacity-60"
                    }`}
                  >
                    <span>{config.pages.includes(page.id) ? "☑️" : "⬜"}</span>
                    <span className="text-lg">{page.icon}</span>
                    <span className="text-xs">{page.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" />
                功能配置
              </label>
              <div className="space-y-2">
                {[
                  { id: "seoOptimized", label: "SEO优化", icon: "🔍", desc: "自动生成SEO友好的URL、标题和元数据" },
                  { id: "mobileFirst", label: "移动优先", icon: "📱", desc: "确保在各种设备上都有完美体验" },
                  { id: "includeBlog", label: "包含博客系统", icon: "📝", desc: "自动生成内容策略和示例文章" },
                  { id: "includeChatbot", label: "集成AI客服", icon: "🤖", desc: "自动回答访客常见问题" },
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setConfig({ ...config, [feature.id]: !config[feature.id as keyof typeof config] })}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                      config[feature.id as keyof typeof config]
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-foreground">{feature.label}</div>
                      <div className="text-[10px] text-muted-foreground">{feature.desc}</div>
                    </div>
                    <span>{config[feature.id as keyof typeof config] ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && isGenerating && (
          <div className="py-8 text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-sm font-medium text-foreground mb-4">AI正在生成您的独立站...</p>
            <div className="max-w-xs mx-auto space-y-2">
              {generationProgress.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    p.status === "completed" ? "bg-green-500 text-white" :
                    p.status === "active" ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {p.status === "completed" ? "✓" : p.status === "active" ? <Loader2 className="w-3 h-3 animate-spin" /> : "○"}
                  </div>
                  <span className={p.status === "active" ? "text-foreground" : "text-muted-foreground"}>
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isGenerating && (
        <div className="px-4 py-3 border-t border-border flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
            >
              上一步
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}
              disabled={!config.siteName || config.pages.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              下一步
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-agent-seo text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              开始生成
            </button>
          )}
        </div>
      )}
    </div>
  );
}
