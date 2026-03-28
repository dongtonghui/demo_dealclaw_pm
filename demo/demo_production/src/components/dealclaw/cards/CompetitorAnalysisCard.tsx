import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";
import { Search, Globe, FileText, TrendingUp, AlertTriangle, Target, ArrowRight, Check, X, ExternalLink, BarChart2 } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

interface Competitor {
  id: string;
  domain: string;
  domainAuthority: number;
  backlinkCount: number;
  topKeywords: string[];
  monthlyTraffic: string;
  contentStrategy: string;
  weaknesses: string[];
  opportunities: string[];
}

interface KeywordGap {
  keyword: string;
  ourRank: number | null;
  competitorRank: number;
  searchVolume: string;
  difficulty: "easy" | "medium" | "hard";
  opportunity: "high" | "medium" | "low";
}

export function CompetitorAnalysisCard({ card, onAction }: Props) {
  const { 
    competitors = [], 
    keywordGaps = [], 
    industry = "SaaS",
    analyzedAt 
  } = card.data as {
    competitors: Competitor[];
    keywordGaps: KeywordGap[];
    industry: string;
    analyzedAt: string;
  };

  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "strategy">("overview");
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(competitors[0] || null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "hard": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case "high": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-3xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕵️</span>
            <span className="text-sm font-medium text-foreground">竞品SEO分析</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            分析时间: {new Date(analyzedAt || Date.now()).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-muted rounded-full text-secondary-foreground">
            行业: {industry}
          </span>
          <span className="text-xs px-2 py-1 bg-muted rounded-full text-secondary-foreground">
            竞品数: {competitors.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "overview", label: "竞品概览", icon: "🌐" },
          { id: "keywords", label: "关键词差距", icon: "🔍" },
          { id: "strategy", label: "策略建议", icon: "📋" },
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
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Competitor Selector */}
            <div className="flex gap-2 flex-wrap">
              {competitors.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetitor(comp)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    selectedCompetitor?.id === comp.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-secondary-foreground"
                  }`}
                >
                  {comp.domain}
                </button>
              ))}
            </div>

            {selectedCompetitor && (
              <>
                {/* Competitor Overview */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{selectedCompetitor.domain}</h4>
                        <a href={`https://${selectedCompetitor.domain}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                          访问网站 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">{selectedCompetitor.domainAuthority}</div>
                      <div className="text-[10px] text-muted-foreground">域名权重</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-semibold text-foreground">{selectedCompetitor.backlinkCount.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">反向链接</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-semibold text-foreground">{selectedCompetitor.monthlyTraffic}</div>
                      <div className="text-[10px] text-muted-foreground">月流量</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-semibold text-foreground">{selectedCompetitor.topKeywords.length}</div>
                      <div className="text-[10px] text-muted-foreground">核心关键词</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1.5">核心关键词</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCompetitor.topKeywords.map((keyword, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weaknesses & Opportunities */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-red-200 dark:border-red-800/50 rounded-lg p-3 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-400">竞品弱点</span>
                    </div>
                    <ul className="space-y-1">
                      {selectedCompetitor.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                          <span>•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-green-200 dark:border-green-800/50 rounded-lg p-3 bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">我们的机会</span>
                    </div>
                    <ul className="space-y-1">
                      {selectedCompetitor.opportunities.map((opp, i) => (
                        <li key={i} className="text-xs text-green-600 flex items-start gap-1">
                          <span>✓</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "keywords" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-foreground">关键词排名差距分析</h4>
              <span className="text-[10px] text-muted-foreground">共 {keywordGaps.length} 个机会关键词</span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">关键词</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">我们的排名</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">竞品排名</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">搜索量</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">难度</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">机会</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordGaps.slice(0, 10).map((gap, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Search className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium">{gap.keyword}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {gap.ourRank ? (
                          <span className={gap.ourRank > 10 ? "text-red-500" : gap.ourRank > 3 ? "text-yellow-600" : "text-green-600"}>
                            #{gap.ourRank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-green-600">#{gap.competitorRank}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{gap.searchVolume}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getDifficultyColor(gap.difficulty)}`}>
                          {gap.difficulty === "easy" ? "易" : gap.difficulty === "medium" ? "中" : "难"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getOpportunityColor(gap.opportunity)}`}>
                          {gap.opportunity === "high" ? "高" : gap.opportunity === "medium" ? "中" : "低"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {keywordGaps.length > 10 && (
              <button
                onClick={() => onAction("view-all-keywords")}
                className="w-full py-2 text-xs text-primary hover:underline"
              >
                查看全部 {keywordGaps.length} 个关键词 →
              </button>
            )}
          </div>
        )}

        {activeTab === "strategy" && (
          <div className="space-y-4">
            {/* Strategy Overview */}
            <div className="border border-border rounded-lg p-3">
              <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                内容策略洞察
              </h4>
              <p className="text-xs text-secondary-foreground leading-relaxed">
                基于竞品分析，我们建议您重点优化以下方向：
                1) 加强长尾关键词布局，填补竞品覆盖不足的领域；
                2) 提升内容深度，目前竞品文章平均长度约2000字，建议我们的内容至少达到2500字；
                3) 增加视频和图表内容，提升页面停留时间。
              </p>
            </div>

            {/* Action Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-foreground">推荐行动</h4>
              {[
                { title: "创建竞品未覆盖的长尾关键词内容", priority: "high", impact: "预估提升30%流量" },
                { title: "优化现有文章标题和Meta描述", priority: "medium", impact: "预估提升15%点击率" },
                { title: "建立更多高质量反向链接", priority: "high", impact: "预估提升20%域名权重" },
                { title: "增加FAQ模块覆盖搜索意图", priority: "medium", impact: "预估进入更多Featured Snippet" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.priority === "high" ? "bg-red-500" : "bg-yellow-500"}`} />
                    <span className="text-xs text-foreground">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-green-600">{item.impact}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <button
          onClick={() => onAction("export-report")}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <BarChart2 className="w-4 h-4" />
          导出完整报告
        </button>
        <button
          onClick={() => onAction("refresh-analysis")}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-agent-seo text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <TrendingUp className="w-4 h-4" />
          重新分析
        </button>
      </div>
    </div>
  );
}
