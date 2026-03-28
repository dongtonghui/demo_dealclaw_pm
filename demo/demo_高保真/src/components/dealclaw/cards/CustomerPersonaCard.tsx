import type { RichCard } from "@/hooks/useChatState";

interface Props {
  card: RichCard;
  onAction: (id: string) => void;
}

export function CustomerPersonaCard({ card, onAction }: Props) {
  const d = card.data;
  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span>🎯</span>
        <span className="text-sm font-medium text-foreground">目标客户画像</span>
      </div>
      <div className="px-4 py-3 space-y-2.5 text-sm">
        <Row icon="🌍" label="地区" value={d.region} />
        <Row icon="🏭" label="行业" value={d.industry} />
        <Row icon="👥" label="规模" value={d.scale} />
        <Row icon="💰" label="年采购" value={d.purchaseVolume} />
        <Row icon="👤" label="决策人" value={d.decisionMaker} />
        <Row icon="⏰" label="时间预期" value={d.timeline} />
      </div>
      {card.actions && (
        <div className="px-4 py-3 border-t border-border flex gap-2 justify-end">
          {card.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
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

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span>{icon}</span>
      <span className="text-muted-foreground shrink-0">{label}：</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
