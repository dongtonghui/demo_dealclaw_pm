import { useState, useRef, useEffect } from "react";
import type { RichCard } from "@/hooks/useChatState";
import { Bold, Italic, Underline, Link, Image, List, ListOrdered, Heading, Quote, Undo, Redo, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

export function SEOArticleEditCard({ card, onAction }: Props) {
  const { article } = card.data;
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [metaDescription, setMetaDescription] = useState(article.metaDescription || "");
  const [keywords, setKeywords] = useState(article.keywords?.join(", ") || "");
  const [activeTab, setActiveTab] = useState<"edit" | "seo" | "preview">("edit");
  const [wordCount, setWordCount] = useState(article.content.length);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setWordCount(content.length);
  }, [content]);

  const handleFormat = (format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = "";

    switch (format) {
      case "bold":
        newText = `**${selectedText || "粗体文字"}**`;
        break;
      case "italic":
        newText = `*${selectedText || "斜体文字"}*`;
        break;
      case "heading":
        newText = `\n## ${selectedText || "标题"}\n`;
        break;
      case "quote":
        newText = `\n> ${selectedText || "引用内容"}\n`;
        break;
      case "list":
        newText = `\n- ${selectedText || "列表项"}\n`;
        break;
      case "numbered":
        newText = `\n1. ${selectedText || "列表项"}\n`;
        break;
      case "link":
        newText = `[${selectedText || "链接文字"}](https://example.com)`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
  };

  const analyzeSEO = () => {
    const issues = [];
    const suggestions = [];

    // 标题分析
    if (title.length < 30) {
      issues.push("标题过短，建议30-60个字符");
    } else if (title.length > 60) {
      issues.push("标题过长，可能截断显示");
    } else {
      suggestions.push("✓ 标题长度合适");
    }

    // 元描述分析
    if (!metaDescription) {
      issues.push("缺少Meta描述，影响搜索结果展示");
    } else if (metaDescription.length < 120) {
      suggestions.push("Meta描述可以更丰富一些（建议120-160字符）");
    }

    // 内容长度分析
    if (content.length < 800) {
      issues.push("内容较短，建议扩展到1500+字符以获得更好排名");
    } else if (content.length > 1500) {
      suggestions.push("✓ 内容长度良好");
    }

    // 关键词密度分析
    const keywordList = keywords.split(",").map(k => k.trim()).filter(Boolean);
    if (keywordList.length === 0) {
      issues.push("未设置目标关键词");
    } else {
      keywordList.forEach(keyword => {
        const regex = new RegExp(keyword, "gi");
        const matches = content.match(regex);
        const density = matches ? (matches.length * keyword.length / content.length * 100).toFixed(1) : 0;
        if (parseFloat(density as string) < 1) {
          suggestions.push(`关键词"${keyword}"密度偏低(${density}%)，建议增加到1-2%`);
        } else if (parseFloat(density as string) > 3) {
          issues.push(`关键词"${keyword}"密度过高(${density}%)，可能被判定为关键词堆砌`);
        } else {
          suggestions.push(`✓ 关键词"${keyword}"密度合适(${density}%)`);
        }
      });
    }

    // 可读性分析
    const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? content.length / sentences.length : 0;
    if (avgSentenceLength > 100) {
      suggestions.push("句子较长，建议适当拆分以提高可读性");
    }

    return { issues, suggestions, score: 100 - issues.length * 10 };
  };

  const seoAnalysis = analyzeSEO();

  const handleSave = () => {
    onAction("save-article", {
      article: {
        ...article,
        title,
        content,
        metaDescription,
        keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
        wordCount,
        lastModified: new Date().toISOString(),
      }
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">✏️</span>
          <span className="text-sm font-medium text-foreground">编辑SEO文章</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${seoAnalysis.score >= 80 ? "bg-green-100 text-green-700" : seoAnalysis.score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
            SEO得分: {seoAnalysis.score}
          </span>
          <span className="text-xs text-muted-foreground">{wordCount} 字符</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "edit", label: "内容编辑", icon: "✏️" },
          { id: "seo", label: "SEO优化", icon: "🔍" },
          { id: "preview", label: "预览效果", icon: "👁️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors relative flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "edit" && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">文章标题 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="输入文章标题..."
              />
              <p className={`text-[10px] mt-1 ${title.length < 30 || title.length > 60 ? "text-red-500" : "text-green-500"}`}>
                {title.length} 字符 (建议30-60字符)
              </p>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg flex-wrap">
              <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => handleFormat("bold")} title="粗体" />
              <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => handleFormat("italic")} title="斜体" />
              <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => handleFormat("underline")} title="下划线" />
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarButton icon={<Heading className="w-4 h-4" />} onClick={() => handleFormat("heading")} title="标题" />
              <ToolbarButton icon={<Quote className="w-4 h-4" />} onClick={() => handleFormat("quote")} title="引用" />
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => handleFormat("list")} title="无序列表" />
              <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => handleFormat("numbered")} title="有序列表" />
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarButton icon={<Link className="w-4 h-4" />} onClick={() => handleFormat("link")} title="链接" />
              <ToolbarButton icon={<Image className="w-4 h-4" />} onClick={() => handleFormat("image")} title="图片" />
            </div>

            {/* Content Editor */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">正文内容 *</label>
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors"
                placeholder="输入文章内容..."
              />
              <p className={`text-[10px] mt-1 ${content.length < 800 ? "text-yellow-500" : "text-green-500"}`}>
                {wordCount} 字符 {content.length < 800 && "(建议1500+字符以获得更好SEO效果)"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-4">
            {/* Meta Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meta描述</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full h-20 px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                placeholder="输入Meta描述，用于搜索结果展示..."
                maxLength={160}
              />
              <p className={`text-[10px] mt-1 ${metaDescription.length > 160 ? "text-red-500" : "text-muted-foreground"}`}>
                {metaDescription.length}/160 字符 (建议120-160字符)
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">目标关键词 (逗号分隔)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="wholesale camping gear, bulk tents, outdoor equipment..."
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                建议3-5个关键词，密度保持在1-2%
              </p>
            </div>

            {/* SEO Analysis */}
            <div className="border border-border rounded-lg p-3">
              <h4 className="text-xs font-medium text-foreground mb-3">🔍 SEO分析</h4>
              
              {seoAnalysis.issues.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-medium text-red-500 mb-1.5">需要改进:</p>
                  <ul className="space-y-1">
                    {seoAnalysis.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                        <span>•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {seoAnalysis.suggestions.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-green-600 mb-1.5">优化建议:</p>
                  <ul className="space-y-1">
                    {seoAnalysis.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-xs text-secondary-foreground flex items-start gap-1.5">
                        <span className="text-green-500">✓</span>
                        {suggestion.replace("✓ ", "")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Content Quality */}
            <div className="grid grid-cols-3 gap-2">
              <QualityMetric label="原创度" value="96%" status="good" />
              <QualityMetric label="可读性" value="良好" status="good" />
              <QualityMetric label="AI痕迹" value="低" status="good" />
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="space-y-4">
            {/* Search Result Preview */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">搜索结果预览</label>
              <div className="border border-border rounded-lg p-3 bg-white dark:bg-slate-900">
                <div className="text-[10px] text-green-700 dark:text-green-400 mb-0.5">https://yourstore.com › blog › wholesale-camping-gear</div>
                <h3 className="text-sm text-blue-600 dark:text-blue-400 font-medium line-clamp-1 hover:underline cursor-pointer">{title || "文章标题"}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{metaDescription || content.substring(0, 150) + "..."}</p>
              </div>
            </div>

            {/* Article Preview */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">文章预览</label>
              <div className="border border-border rounded-lg p-4 bg-background">
                <h1 className="text-lg font-bold text-foreground mb-2">{title || "文章标题"}</h1>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                  <span>发布: {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>作者: SEO Agent</span>
                  <span>•</span>
                  <span>{Math.ceil(wordCount / 500)} 分钟阅读</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
                    {content.length > 500 ? content.substring(0, 500) + "..." : content || "文章内容"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <span>💾</span>
          保存文章
        </button>
        <button
          onClick={() => onAction("publish-article", { article: { title, content, metaDescription, keywords: keywords.split(",").map(k => k.trim()).filter(Boolean) } })}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-agent-seo text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <span>🚀</span>
          发布到独立站
        </button>
        <button
          onClick={() => onAction("cancel-edit")}
          className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, onClick, title }: { icon: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
    >
      {icon}
    </button>
  );
}

function QualityMetric({ label, value, status }: { label: string; value: string; status: "good" | "warning" | "bad" }) {
  const colors = {
    good: "text-green-600 bg-green-50",
    warning: "text-yellow-600 bg-yellow-50",
    bad: "text-red-600 bg-red-50",
  };

  return (
    <div className={`text-center p-2 rounded-lg ${colors[status]}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
