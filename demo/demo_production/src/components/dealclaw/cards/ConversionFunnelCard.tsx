import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Download,
  ArrowRight,
  Filter,
  Eye,
  MousePointer,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate?: number;
}

interface ConversionFunnelCardProps {
  data: {
    stages: FunnelStage[];
    period: string;
    totalRevenue: number;
    averageDealSize: number;
    channelBreakdown?: Record<string, number[]>;
  };
  onAction: (actionId: string, data?: any) => void;
}

const STAGE_ICONS = [
  Eye,
  MousePointer,
  MessageSquare,
  Target,
  CheckCircle,
];

const STAGE_COLORS = [
  'bg-blue-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-emerald-600',
];

const STAGE_BG_COLORS = [
  'bg-blue-50',
  'bg-cyan-50',
  'bg-teal-50',
  'bg-green-50',
  'bg-emerald-50',
];

export function ConversionFunnelCard({ data, onAction }: ConversionFunnelCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    return '¥' + amount.toLocaleString();
  };

  const maxCount = Math.max(...data.stages.map(s => s.count));
  const overallConversion = data.stages.length > 0 
    ? ((data.stages[data.stages.length - 1].count / data.stages[0].count) * 100).toFixed(2)
    : '0';

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-500" />
            转化漏斗分析
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{data.period}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('export-funnel')}
            >
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">总营收</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.totalRevenue)}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">平均客单价</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data.averageDealSize)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-gray-600">整体转化率</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {overallConversion}%
            </p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">转化流程</h4>
          
          <div className="space-y-3">
            {data.stages.map((stage, index) => {
              const Icon = STAGE_ICONS[index] || Users;
              const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
              const prevStage = index > 0 ? data.stages[index - 1] : null;
              const dropOffCount = prevStage ? prevStage.count - stage.count : 0;
              const dropOffRate = prevStage && prevStage.count > 0
                ? ((dropOffCount / prevStage.count) * 100).toFixed(1)
                : null;

              return (
                <div key={stage.name} className="relative">
                  {/* Stage Bar */}
                  <div className="flex items-center gap-4">
                    <div 
                      className={`${STAGE_COLORS[index]} h-16 rounded-lg flex items-center px-4 text-white transition-all duration-500 shadow-sm`}
                      style={{ width: `${Math.max(widthPercent, 20)}%`, minWidth: '120px' }}
                    >
                      <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-medium whitespace-nowrap">{stage.name}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-800">{formatNumber(stage.count)}</span>
                        <Badge variant="outline" className="text-xs bg-white">
                          转化率 {stage.conversionRate}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Drop-off Indicator */}
                  {dropOffRate && parseFloat(dropOffRate) > 0 && index < data.stages.length - 1 && (
                    <div className="flex items-center gap-2 ml-6 my-2">
                      <div className="flex items-center gap-1 text-sm text-red-500 bg-red-50 px-2 py-1 rounded">
                        <ArrowRight className="w-3 h-3 rotate-90" />
                        <span>流失 {dropOffCount.toLocaleString()} ({dropOffRate}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            转化洞察
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>从曝光到访问的转化率为 {data.stages[1]?.conversionRate || 0}%，行业平均水平为 20-30%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>线索到商机的转化率表现良好，建议继续保持当前的跟进节奏</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Email 渠道带来的线索转化率最高（32%），建议加大该渠道投入</span>
            </li>
          </ul>
        </div>

        {/* Channel Breakdown (if available) */}
        {data.channelBreakdown && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">渠道分布</h4>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(data.channelBreakdown).map(([channel, values]) => (
                <div key={channel} className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 capitalize">{channel}</p>
                  <p className="text-lg font-semibold">{values[values.length - 1]?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
