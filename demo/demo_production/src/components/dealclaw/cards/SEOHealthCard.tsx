import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";
import { Heart, AlertTriangle, CheckCircle, XCircle, Globe, Search, FileText, Link, Zap, Clock, ArrowRight, RefreshCw, Settings } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

type IssueType = "critical" | "warning" | "info";
type CheckCategory = "technical" | "content" | "links" | "performance";

interface HealthCheck {
  id: string;
  name: string;
  category: CheckCategory;
  status: "passed" | "failed" | "warning";
  score: number;
  issues: {
    type: IssueType;
    message: string;
    recommendation: string;
  }[];
}

interface SiteHealth {
  overallScore: number;
  status: "healthy" | "needs_attention" | "critical";
  lastScan: string;
  checks: HealthCheck[];
  metrics: {
    crawlablePages: number;
    indexedPages: number;
    brokenLinks: number;
    duplicateContent: number;
    missingMeta: number;
    slowPages: number;
  };
}

export function SEOHealthCard({ card, onAction }: Props) {
  const { siteHealth } = card.data as { siteHealth: SiteHealth };
  const [activeCategory, setActiveCategory] = useState<CheckCategory | "all">("all");
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const categories: { id: CheckCategory | "all"; name: string; icon: string }[] = [
    { id: "all", name: "全部", icon: "📊" },
    { id: "technical", name: "技术", icon: "🔧" },
    { id: "content", name: "内容", icon: "📝" },
    { id: "links", name: "链接", icon: "🔗" },
    { id: "performance", name: "性能", icon: "⚡" },
  ];

  const filteredChecks = activeCategory === "all"
    ? siteHealth.checks
    : siteHealth.checks.filter(c => c.category === activeCategory);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <Heart className="w-5 h-5 text-green-500" />;
      case "needs_attention": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "critical": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getIssueIcon = (type: IssueType) => {
    switch (type) {
      case "critical": return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info": return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsScanning(false);
    onAction("scan-complete");
  };

  const criticalIssues = siteHealth.checks.flatMap(c => c.issues).filter(i => i.type === "critical").length;
  const warningIssues = siteHealth.checks.flatMap(c => c.issues).filter(i => i.type === "warning").length;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-3xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(siteHealth.status)}
            <span className="text-sm font-medium text-foreground">SEO健康监控</span>
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "扫描中..." : "重新扫描"}
          </button>
        </div>

        {/* Overall Score */}
        <div className={`border rounded-lg p-3 ${getScoreBg(siteHealth.overallScore)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${getScoreColor(siteHealth.overallScore)}`}>
                {siteHealth.overallScore}
              </div>
              <div className="text-xs">
                <div className="font-medium text-foreground">总体健康评分</div>
                <div className="text-muted-foreground">
                  {siteHealth.status === "healthy" ? "网站状态良好" :
                   siteHealth.status === "needs_attention" ? "需要关注一些问题" :
                   "存在严重问题需要修复"}
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-muted-foreground">上次扫描</div>
              <div>{new Date(siteHealth.lastScan).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-border">
        <div className="grid grid-cols-3 gap-3">
          <QuickStat
            icon={<Globe className="w-4 h-4 text-blue-500" />}
            label="可抓取页面"
            value={siteHealth.metrics.crawlablePages}
            subValue={`${siteHealth.metrics.indexedPages} 已收录`}
          />
          <QuickStat
            icon={<Link className="w-4 h-4 text-red-500" />}
            label="问题链接"
            value={siteHealth.metrics.brokenLinks}
            subValue={siteHealth.metrics.brokenLinks > 0 ? "需要修复" : "一切正常"}
            isNegative={siteHealth.metrics.brokenLinks > 0}
          />
          <QuickStat
            icon={<Zap className="w-4 h-4 text-yellow-500" />}
            label="慢速页面"
            value={siteHealth.metrics.slowPages}
            subValue={siteHealth.metrics.slowPages > 0 ? "需要优化" : "性能良好"}
            isNegative={siteHealth.metrics.slowPages > 0}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative ${
              activeCategory === cat.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
            {activeCategory === cat.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Issues Summary */}
      {(criticalIssues > 0 || warningIssues > 0) && (
        <div className="px-4 py-2 border-b border-border bg-muted/30 flex gap-4">
          {criticalIssues > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <XCircle className="w-3.5 h-3.5" />
              {criticalIssues} 个严重问题
            </div>
          )}
          {warningIssues > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              {warningIssues} 个警告
            </div>
          )}
        </div>
      )}

      {/* Checks List */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {filteredChecks.map((check) => (
            <div
              key={check.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                check.status === "passed" ? "border-green-200" :
                check.status === "warning" ? "border-yellow-200" :
                "border-red-200"
              }`}
            >
              <button
                onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {check.status === "passed" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : check.status === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs font-medium text-foreground">{check.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${getScoreColor(check.score)}`}>
                    {check.score}/100
                  </span>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                    expandedCheck === check.id ? "rotate-90" : ""
                  }`} />
                </div>
              </button>

              {expandedCheck === check.id && check.issues.length > 0 && (
                <div className="px-3 pb-3 border-t border-border bg-muted/20">
                  <div className="pt-2 space-y-2">
                    {check.issues.map((issue, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <p className="text-secondary-foreground">{issue.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            建议: {issue.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <button
          onClick={() => onAction("view-detailed-report")}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <FileText className="w-4 h-4" />
          查看详细报告
        </button>
        <button
          onClick={() => onAction("fix-all-issues")}
          disabled={criticalIssues === 0 && warningIssues === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-agent-seo text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Settings className="w-4 h-4" />
          一键修复问题
        </button>
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  subValue,
  isNegative = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue: string;
  isNegative?: boolean;
}) {
  return (
    <div className="text-center p-2">
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className={`text-lg font-semibold ${isNegative && value > 0 ? "text-red-600" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{subValue}</div>
    </div>
  );
}
