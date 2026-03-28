import { useState } from "react";
import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string, data?: Record<string, any>) => void;
}

export function CompanyProfileEditCard({ card, onAction }: Props) {
  const [data, setData] = useState(card.data);

  const handleChange = (field: string, value: string) => {
    setData((prev: Record<string, any>) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onAction("save-profile", data);
  };

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>🏢</span>
        <span className="text-sm font-medium text-foreground">编辑企业画像</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        <EditField
          label="产品类别"
          value={data.category}
          onChange={(v) => handleChange("category", v)}
          placeholder="例如：户外用品、电子产品"
        />
        <EditField
          label="核心优势"
          value={data.advantage}
          onChange={(v) => handleChange("advantage", v)}
          placeholder="例如：自有工厂、OEM定制"
        />
        <EditField
          label="主营市场"
          value={data.market}
          onChange={(v) => handleChange("market", v)}
          placeholder="例如：北美、欧洲"
        />
        <EditField
          label="目标客户"
          value={data.targetCustomer}
          onChange={(v) => handleChange("targetCustomer", v)}
          placeholder="例如：批发商、品牌商"
        />
        <EditField
          label="价格定位"
          value={data.priceRange}
          onChange={(v) => handleChange("priceRange", v)}
          placeholder="例如：中高端、性价比"
        />
      </div>
      {card.actions && (
        <div className="px-4 py-3 border-t border-border flex gap-2 justify-end">
          {card.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => action.id === "save-profile" ? handleSave() : onAction(action.id)}
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
