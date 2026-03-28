import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";
import { Search, TrendingUp, Target, BarChart3, Copy, Plus, Check, ArrowRight, Filter, Download, Sparkles } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

type KeywordIntent = "informational" | "navigational" | "commercial" | "transactional";
type KeywordDifficulty = "easy" | "medium" | "hard";

interface Keyword {
  id: string;
  term: string;
  volume: string;
  difficulty: KeywordDifficulty;
  cpc: string;
  intent: KeywordIntent;
  competition: "low" | "medium" | "high";
  trend: "up" | "down" | "stable";
  relevance: number;
  relatedTerms: string[];
}

export function KeywordRecommendCard({ card, onAction }: Props) {
  const { 
    keywords = [], 
    topic = "",
    generatedAt 
  } = card.data as {
    keywords: Keyword[];
    topic: string;
    generatedAt: string;
  };

  const [activeTab, setActiveTab] = useState<"all" | "opportunity" | "trending">("all");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const intentLabels: Record<KeywordIntent, string> = {
    informational: "信息型",
    navigational: "导航型",
    commercial: "商业型",
    transactional: "交易型",
  };

  const intentColors: Record<KeywordIntent, string> = {
    informational: "bg-blue-50 text-blue-600",
    navigational: "bg-purple-50 text-purple-600",
    commercial: "bg-yellow-50 text-yellow-600",
    transactional: "bg-green-50 text-green-600",
  };

  const difficultyLabels: Record<KeywordDifficulty, string> = {
    easy: "容易",
    medium: "中等",
    hard: "困难",
  };

  const filteredKeywords = keywords.filter(kw => {
    const matchesSearch = kw.term.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         kw.relatedTerms.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
    
    if (activeTab === "opportunity") {
      return matchesSearch && kw.difficulty === "easy" && kw.competition === "low";
    }
    if (activeTab === "trending") {
      return matchesSearch && kw.trend === "up";
    }
    return matchesSearch;
  });

  const toggleKeyword = (id: string) => {
    setSelectedKeywords(prev =>
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectAll = () => {
    if (selectedKeywords.length === filteredKeywords.length) {
      setSelectedKeywords([]);
    } else {
      setSelectedKeywords(filteredKeywords.map(k => k.id));
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-3xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔍</span>
          <span className="text-sm font-medium text-foreground">关键词推荐</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-agent-seo/10 text-agent-seo rounded-full">
            主题: {topic}
          </span>
          <span className="text-[10px] text-muted-foreground">
            生成于 {new Date(generatedAt || Date.now()).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 border-b border-border bg-muted/20">
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-primary" />
            共 {keywords.length} 个关键词
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            {keywords.filter(k => k.trend === "up").length} 个上升趋势
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            {keywords.filter(k => k.difficulty === "easy" && k.competition === "low").length} 个机会词
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "all", label: "全部推荐", count: keywords.length },
          { id: "opportunity", label: "高机会词", count: keywords.filter(k => k.difficulty === "easy" && k.competition === "low").length },
          { id: "trending", label: "热门趋势", count: keywords.filter(k => k.trend === "up").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? "bg-primary/20" : "bg-muted"
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="搜索关键词..."
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={selectAll}
          className="text-xs px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          {selectedKeywords.length === filteredKeywords.length ? "取消全选" : "全选"}
        </button>
        <button
          onClick={() => onAction("export-keywords", { keywords: selectedKeywords })}
          disabled={selectedKeywords.length === 0}
          className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Keywords List */}
      <div className="max-h-[400px] overflow-y-auto">
        <div className="divide-y divide-border">
          {filteredKeywords.map((keyword) => (
            <div
              key={keyword.id}
              className={`p-3 hover:bg-muted/30 transition-colors ${
                selectedKeywords.includes(keyword.id) ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedKeywords.includes(keyword.id)}
                  onChange={() => toggleKeyword(keyword.id)}
                  className="mt-0.5 rounded border-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">{keyword.term}</span>
                    {keyword.trend === "up" && (
                      <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        上升
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(keyword.term, keyword.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copiedId === keyword.id ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] text-muted-foreground">搜索量: {keyword.volume}</span>
                    <span className="text-[10px] text-muted-foreground">CPC: {keyword.cpc}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${intentColors[keyword.intent]}`}>
                      {intentLabels[keyword.intent]}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      keyword.difficulty === "easy" ? "bg-green-50 text-green-600" :
                      keyword.difficulty === "medium" ? "bg-yellow-50 text-yellow-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      难度: {difficultyLabels[keyword.difficulty]}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      keyword.competition === "low" ? "bg-green-50 text-green-600" :
                      keyword.competition === "medium" ? "bg-yellow-50 text-yellow-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      竞争: {keyword.competition === "low" ? "低" : keyword.competition === "medium" ? "中" : "高"}
                    </span>
                  </div>

                  {/* Related Terms */}
                  <div className="flex flex-wrap gap-1">
                    {keyword.relatedTerms.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setSearchFilter(term)}
                        className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-foreground">{keyword.relevance}%</div>
                  <div className="text-[10px] text-muted-foreground">相关度</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredKeywords.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">未找到匹配的关键词</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <button
          onClick={() => onAction("generate-content", { keywords: selectedKeywords })}
          disabled={selectedKeywords.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          为选中词生成内容
        </button>
        <button
          onClick={() => onAction("add-to-strategy", { keywords: selectedKeywords })}
          disabled={selectedKeywords.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-agent-seo text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Plus className="w-4 h-4" />
          添加到策略
        </button>
      </div>
    </div>
  );
}
