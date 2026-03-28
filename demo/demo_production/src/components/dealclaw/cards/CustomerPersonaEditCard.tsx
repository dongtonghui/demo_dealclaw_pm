import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

export function CustomerPersonaEditCard({ card, onAction }: Props) {
  const [data, setData] = useState(card.data);

  const handleChange = (field: string, value: string) => {
    setData((prev: Record<string, any>) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onAction("save-persona", data);
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>🎯</span>
        <span className="text-sm font-medium text-foreground">编辑客户画像</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        <EditField
          label="目标地区"
          value={data.region}
          onChange={(v) => handleChange("region", v)}
          placeholder="例如：美国、欧洲"
        />
        <EditField
          label="行业类型"
          value={data.industry}
          onChange={(v) => handleChange("industry", v)}
          placeholder="例如：户外用品批发"
        />
        <EditField
          label="企业规模"
          value={data.scale}
          onChange={(v) => handleChange("scale", v)}
          placeholder="例如：中型（50-200人）"
        />
        <EditField
          label="年采购额"
          value={data.purchaseVolume}
          onChange={(v) => handleChange("purchaseVolume", v)}
          placeholder="例如：100万-500万美元/年"
        />
        <EditField
          label="决策人"
          value={data.decisionMaker}
          onChange={(v) => handleChange("decisionMaker", v)}
          placeholder="例如：采购经理/采购总监"
        />
        <EditField
          label="时间预期"
          value={data.timeline}
          onChange={(v) => handleChange("timeline", v)}
          placeholder="例如：3个月内"
        />
      </div>
      {card.actions && (
        <div className="px-4 py-3 border-t border-border flex gap-2 justify-end">
          {card.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => action.id === "save-persona" ? handleSave() : onAction(action.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                action.variant === "primary"
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
    </div>
  );
}
