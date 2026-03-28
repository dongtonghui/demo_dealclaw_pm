import { useState } from "react";
import { LeftSidebar } from "@/components/dealclaw/LeftSidebar";
import { ChatPanel } from "@/components/dealclaw/ChatPanel";
import { ContextPanel } from "@/components/dealclaw/ContextPanel";
import { useChatState } from "@/hooks/useChatState";

const Index = () => {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const chatState = useChatState();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <LeftSidebar
        activeTask={chatState.activeTask}
        onSelectTask={chatState.setActiveTask}
      />
      <ChatPanel
        messages={chatState.messages}
        onSendMessage={chatState.sendMessage}
        onCardAction={chatState.handleCardAction}
        isTyping={chatState.isTyping}
      />
      <ContextPanel
        open={rightPanelOpen}
        onToggle={() => setRightPanelOpen(!rightPanelOpen)}
        activeTask={chatState.activeTask}
        agentStatuses={chatState.agentStatuses}
      />
    </div>
  );
};

export default Index;
