import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";
import { TrendingUp, Eye, MousePointer, Clock, Share2, ArrowUpRight, ArrowDownRight, BarChart3, Calendar, Filter } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

interface ArticleMetric {
  date: string;
  views: number;
  clicks: number;
  avgTime: number;
  bounceRate: number;
}

interface ArticleData {
  id: string;
  title: string;
  publishDate: string;
  totalViews: number;
  totalClicks: number;
  ctr: number;
  avgTime: string;
  ranking: number;
  keywords: string[];
  weeklyData: ArticleMetric[];
}

export function ArticleAnalyticsCard({ card, onAction }: Props) {
  const { articles = [], timeRange = "7d" } = card.data as { articles: ArticleData[]; timeRange: string };
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(articles[0] || null);
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);

  const timeRanges = [
    { id: "7d", label: "7天" },
    { id: "30d", label: "30天" },
    { id: "90d", label: "90天" },
  ];

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: "∞", isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-3xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="text-sm font-medium text-foreground">文章效果数据</span>
        </div>
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setCurrentTimeRange(range.id)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                currentTimeRange === range.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Sidebar - Article List */}
        <div className="w-64 border-r border-border p-3 bg-muted/20">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            文章列表
          </h4>
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                  selectedArticle?.id === article.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted border border-transparent"
                }`}
              >
                <div className="font-medium text-foreground line-clamp-1 mb-1">{article.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {article.totalViews.toLocaleString()}
                  {article.ranking <= 10 && (
                    <span className="text-green-600 bg-green-50 px-1 rounded">#{article.ranking}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {selectedArticle ? (
            <div className="space-y-4">
              {/* Article Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">{selectedArticle.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      发布于 {new Date(selectedArticle.publishDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      {selectedArticle.keywords.slice(0, 3).join(", ")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">#{selectedArticle.ranking}</div>
                  <div className="text-[10px] text-muted-foreground">搜索排名</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-3">
                <MetricCard
                  icon={<Eye className="w-4 h-4 text-blue-500" />}
                  label="总浏览量"
                  value={selectedArticle.totalViews.toLocaleString()}
                  change={calculateChange(selectedArticle.totalViews, selectedArticle.totalViews * 0.85)}
                />
                <MetricCard
                  icon={<MousePointer className="w-4 h-4 text-green-500" />}
                  label="总点击数"
                  value={selectedArticle.totalClicks.toLocaleString()}
                  change={calculateChange(selectedArticle.totalClicks, selectedArticle.totalClicks * 0.9)}
                />
                <MetricCard
                  icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
                  label="点击率"
                  value={`${selectedArticle.ctr}%`}
                  change={calculateChange(selectedArticle.ctr, selectedArticle.ctr * 0.95)}
                />
                <MetricCard
                  icon={<Clock className="w-4 h-4 text-orange-500" />}
                  label="平均停留"
                  value={selectedArticle.avgTime}
                  change={calculateChange(120, 115)}
                />
              </div>

              {/* Chart Placeholder */}
              <div className="border border-border rounded-lg p-4 bg-background">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">📈 流量趋势</h4>
                <div className="h-32 flex items-end gap-1">
                  {selectedArticle.weeklyData.map((data, i) => {
                    const maxViews = Math.max(...selectedArticle.weeklyData.map(d => d.views));
                    const height = maxViews > 0 ? (data.views / maxViews) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                          style={{ height: `${height}%`, minHeight: "4px" }}
                        />
                        <span className="text-[8px] text-muted-foreground">
                          {new Date(data.date).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  <span>浏览量</span>
                  <span>最近{currentTimeRange === "7d" ? "7" : currentTimeRange === "30d" ? "30" : "90"}天</span>
                </div>
              </div>

              {/* Keywords Performance */}
              <div className="border border-border rounded-lg p-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">🎯 关键词排名</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-1 bg-muted rounded-full text-secondary-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onAction("view-detailed-analytics", { articleId: selectedArticle.id })}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  <BarChart3 className="w-4 h-4" />
                  查看详细报告
                </button>
                <button
                  onClick={() => onAction("optimize-article", { articleId: selectedArticle.id })}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-agent-seo text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  <TrendingUp className="w-4 h-4" />
                  优化文章
                </button>
                <button
                  onClick={() => onAction("share-report", { articleId: selectedArticle.id })}
                  className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">选择一篇文章查看效果数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: { value: string; isPositive: boolean };
}) {
  return (
    <div className="border border-border rounded-lg p-3 bg-background">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        <span className={`flex items-center text-[10px] ${change.isPositive ? "text-green-600" : "text-red-600"}`}>
          {change.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change.value}%
        </span>
      </div>
    </div>
  );
}
