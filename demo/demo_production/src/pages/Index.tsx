import { useState } from "react";
import { LeftSidebar } from "@/components/dealclaw/LeftSidebar";
import { ChatPanel } from "@/components/dealclaw/ChatPanel";
import { ContextPanel } from "@/components/dealclaw/ContextPanel";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useChatState } from "@/hooks/useChatState";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const Index = () => {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const chatState = useChatState();
  const { isMobile } = useBreakpoint();

  // Mobile layout
  if (isMobile) {
    return <MobileLayout chatState={chatState} />;
  }

  // Desktop layout
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
        onFileUpload={chatState.handleFileUpload}
        isTyping={chatState.isTyping}
      />
      <ContextPanel
        open={rightPanelOpen}
        onToggle={() => setRightPanelOpen(!rightPanelOpen)}
        activeTask={chatState.activeTask}
        agentStatuses={chatState.agentStatuses}
        leads={chatState.leads}
      />
    </div>
  );
};

export default Index;
