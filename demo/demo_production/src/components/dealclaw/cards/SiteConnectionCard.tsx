import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";
import { Globe, Check, AlertCircle, RefreshCw, ExternalLink, Trash2, Edit3 } from "lucide-react";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

type PlatformType = "wordpress" | "shopify" | "squarespace" | "wix" | "custom";

interface ConnectedSite {
  id: string;
  platform: PlatformType;
  name: string;
  url: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  autoPublish: boolean;
}

const platformIcons: Record<PlatformType, string> = {
  wordpress: "📝",
  shopify: "🛒",
  squarespace: "🎨",
  wix: "✨",
  custom: "🔧",
};

const platformNames: Record<PlatformType, string> = {
  wordpress: "WordPress",
  shopify: "Shopify",
  squarespace: "Squarespace",
  wix: "Wix",
  custom: "自定义API",
};

export function SiteConnectionCard({ card, onAction }: Props) {
  const { sites: initialSites = [] } = card.data;
  const [sites, setSites] = useState<ConnectedSite[]>(initialSites);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSite, setEditingSite] = useState<ConnectedSite | null>(null);
  const [formData, setFormData] = useState({
    platform: "wordpress" as PlatformType,
    name: "",
    url: "",
    apiKey: "",
    autoPublish: true,
  });

  const handleConnect = () => {
    const newSite: ConnectedSite = {
      id: Date.now().toString(),
      platform: formData.platform,
      name: formData.name,
      url: formData.url,
      status: "connected",
      lastSync: new Date().toISOString(),
      autoPublish: formData.autoPublish,
    };
    
    setSites([...sites, newSite]);
    setShowAddForm(false);
    setFormData({ platform: "wordpress", name: "", url: "", apiKey: "", autoPublish: true });
    
    onAction("site-connected", { site: newSite });
  };

  const handleUpdate = () => {
    if (!editingSite) return;
    
    const updatedSites = sites.map(s =>
      s.id === editingSite.id
        ? { ...s, name: formData.name, url: formData.url, autoPublish: formData.autoPublish }
        : s
    );
    
    setSites(updatedSites);
    setEditingSite(null);
    setFormData({ platform: "wordpress", name: "", url: "", apiKey: "", autoPublish: true });
    
    onAction("site-updated", { siteId: editingSite.id });
  };

  const handleDelete = (siteId: string) => {
    setSites(sites.filter(s => s.id !== siteId));
    onAction("site-disconnected", { siteId });
  };

  const handleTestConnection = (siteId: string) => {
    onAction("test-connection", { siteId });
  };

  const startEdit = (site: ConnectedSite) => {
    setEditingSite(site);
    setFormData({
      platform: site.platform,
      name: site.name,
      url: site.url,
      apiKey: "",
      autoPublish: site.autoPublish,
    });
  };

  const renderStatus = (status: ConnectedSite["status"]) => {
    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3" />
            已连接
          </span>
        );
      case "disconnected":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            已断开
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            连接异常
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden max-w-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <span className="text-sm font-medium text-foreground">独立站连接管理</span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          + 添加站点
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {sites.length === 0 && !showAddForm ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-1">暂无连接的独立站</p>
            <p className="text-xs">添加您的第一个站点开始自动发布文章</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sites.map((site) => (
              <div key={site.id} className="border border-border rounded-lg p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platformIcons[site.platform]}</span>
                    <div>
                      <div className="text-sm font-medium text-foreground">{site.name}</div>
                      <div className="text-[10px] text-muted-foreground">{platformNames[site.platform]}</div>
                    </div>
                  </div>
                  {renderStatus(site.status)}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Globe className="w-3 h-3" />
                  <span className="truncate flex-1">{site.url}</span>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground">
                    {site.lastSync && `上次同步: ${new Date(site.lastSync).toLocaleString()}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTestConnection(site.id)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      title="测试连接"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(site)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(site.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {site.autoPublish && (
                  <div className="mt-2 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded">
                    ✓ 已启用自动发布
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingSite) && (
          <div className="mt-4 border border-border rounded-lg p-4 bg-muted/30">
            <h4 className="text-sm font-medium text-foreground mb-3">
              {editingSite ? "编辑站点" : "添加新站点"}
            </h4>
            
            <div className="space-y-3">
              {/* Platform */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">平台类型</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.keys(platformNames) as PlatformType[]).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setFormData({ ...formData, platform })}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        formData.platform === platform
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-lg mb-0.5">{platformIcons[platform]}</div>
                      <div className="text-[10px]">{platformNames[platform]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Site Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">站点名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="我的WordPress站点"
                />
              </div>

              {/* Site URL */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">站点URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="https://yourstore.com"
                />
              </div>

              {/* API Key */}
              {!editingSite && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API密钥</label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                    placeholder="输入API密钥"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    在您的{platformNames[formData.platform]}后台生成API密钥
                  </p>
                </div>
              )}

              {/* Auto Publish */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoPublish"
                  checked={formData.autoPublish}
                  onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="autoPublish" className="text-xs text-secondary-foreground">
                  启用自动发布（审核后自动同步到站点）
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={editingSite ? handleUpdate : handleConnect}
                  disabled={!formData.name || !formData.url}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {editingSite ? "保存更改" : "连接站点"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSite(null);
                    setFormData({ platform: "wordpress", name: "", url: "", apiKey: "", autoPublish: true });
                  }}
                  className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:text-foreground transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {sites.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">提示:</span> 连接站点后，您可以在文章编辑器中直接发布内容到选定的站点。
          </p>
        </div>
      )}
    </div>
  );
}
