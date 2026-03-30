import { useState, useCallback, useRef, useEffect } from "react";
import { LeftSidebar } from "@/components/dealclaw/LeftSidebar";
import { ChatPanel } from "@/components/dealclaw/ChatPanel";
import { ContextPanel } from "@/components/dealclaw/ContextPanel";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useChatState, type ChatMessage, type Lead } from "@/hooks/useChatState";
import { useDemoFlow, DEMO_LEADS } from "@/hooks/useDemoFlow";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, User, Building2, Mail, TrendingUp } from "lucide-react";

const Index = () => {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showLeadNotification, setShowLeadNotification] = useState(false);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  
  // Demo stacked notifications state
  const [demoNotifications, setDemoNotifications] = useState<number[]>([]); // Array of visible notification indices
  const chatState = useChatState();
  const { isMobile } = useBreakpoint();
  
  // Demo mode messages override
  const [demoMessages, setDemoMessages] = useState<ChatMessage[] | null>(null);
  const [demoAgentStatuses, setDemoAgentStatuses] = useState(chatState.agentStatuses);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  
  // Demo lead notification state
  const [currentDemoLeadIndex, setCurrentDemoLeadIndex] = useState(0);
  const currentDemoLead = DEMO_LEADS[currentDemoLeadIndex];
  
  // Use demo messages when in demo mode, otherwise use chatState messages
  const displayMessages = demoMessages || chatState.messages;
  const displayAgentStatuses = isDemoRunning ? demoAgentStatuses : chatState.agentStatuses;
  
  // Handle adding messages during demo
  const handleDemoMessagesAdd = useCallback((messages: ChatMessage[]) => {
    setDemoMessages(prev => {
      const current = prev || [];
      return [...current, ...messages];
    });
  }, []);

  // Handle agent status changes during demo
  const handleDemoAgentStatusChange = useCallback((agent: string, status: string, task?: string, progress?: number) => {
    setDemoAgentStatuses(prev => 
      prev.map(a => 
        a.agent === agent 
          ? { ...a, status: status as any, task, progress } 
          : a
      )
    );
  }, []);

  // Handle lead notification during demo
  const handleDemoLeadNotification = useCallback((leadIndex: number) => {
    setCurrentDemoLeadIndex(leadIndex);
    setDemoNotifications(prev => [...prev, leadIndex]);
    setShowLeadNotification(true);
    // Play notification sound (optional)
    // const audio = new Audio('/notification.mp3');
    // audio.play().catch(() => {});
  }, []);

  // Initialize demo flow
  const demoFlow = useDemoFlow(
    handleDemoMessagesAdd,
    handleDemoAgentStatusChange,
    handleDemoLeadNotification
  );

  // Start demo handler
  const handleStartDemo = useCallback(() => {
    // Reset demo state
    setDemoMessages([]);
    setDemoAgentStatuses(chatState.agentStatuses.map(a => ({ ...a, status: "idle", task: undefined, progress: 0 })));
    setIsDemoRunning(true);
    setShowLeadNotification(false);
    setShowLeadDetail(false);
    setDemoNotifications([]);
    
    // Start the demo flow
    demoFlow.startDemo();
  }, [chatState.agentStatuses, demoFlow]);

  // Stop demo handler
  const handleStopDemo = useCallback(() => {
    demoFlow.stopDemo();
    setIsDemoRunning(false);
    setDemoMessages(null);
    setShowLeadNotification(false);
    setShowLeadDetail(false);
    setDemoNotifications([]);
  }, [demoFlow]);

  // Handle card actions during demo
  const handleDemoCardAction = useCallback((actionId: string, data?: Record<string, any>) => {
    // Handle demo-specific actions
    if (actionId === "confirm-profile" || actionId === "confirm-persona" || actionId === "confirm-plan") {
      demoFlow.handleAction(actionId);
    } else if (actionId === "view-lead") {
      setShowLeadDetail(true);
    } else {
      // Fallback to normal chat state handler
      chatState.handleCardAction(actionId, data);
    }
  }, [chatState, demoFlow]);

  // Override send message during demo to prevent user input
  const handleSendMessage = useCallback((text: string) => {
    if (isDemoRunning) {
      // In demo mode, only allow specific interactions
      if (text === "confirm-profile" || text === "confirm-persona" || text === "confirm-plan") {
        demoFlow.handleAction(text);
      } else {
        // Show a system message that demo is running
        handleDemoMessagesAdd([{
          id: `system-${Date.now()}`,
          role: "system",
          content: "演示进行中，请点击卡片按钮继续...",
          timestamp: new Date(),
        }]);
      }
    } else {
      chatState.sendMessage(text);
    }
  }, [isDemoRunning, chatState, demoFlow, handleDemoMessagesAdd]);

  // Mobile layout
  if (isMobile) {
    return <MobileLayout chatState={chatState} />;
  }

  // Desktop layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background relative">
      <LeftSidebar
        activeTask={chatState.activeTask}
        onSelectTask={chatState.setActiveTask}
        onStartDemo={handleStartDemo}
        onStopDemo={handleStopDemo}
        isDemoRunning={isDemoRunning}
      />
      <ChatPanel
        messages={displayMessages}
        onSendMessage={handleSendMessage}
        onCardAction={handleDemoCardAction}
        onFileUpload={chatState.handleFileUpload}
        isTyping={chatState.isTyping || (isDemoRunning && !demoFlow.canProceed)}
      />
      <ContextPanel
        open={rightPanelOpen}
        onToggle={() => setRightPanelOpen(!rightPanelOpen)}
        activeTask={chatState.activeTask}
        agentStatuses={displayAgentStatuses}
        leads={chatState.leads}
      />
      
      {/* Demo Badge */}
      <AnimatePresence>
        {isDemoRunning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">演示模式</span>
              <span className="text-xs opacity-80">|</span>
              <span className="text-xs opacity-80">
                {demoFlow.currentStep === "idle" && "准备中..."}
                {demoFlow.currentStep.includes("onboarding") && "企业知识录入"}
                {demoFlow.currentStep.includes("task") && "创建获客任务"}
                {demoFlow.currentStep === "coordinating_agents" && "协调Agent团队"}
                {demoFlow.currentStep === "strategy_generated" && "生成获客方案"}
                {demoFlow.currentStep === "new_lead_notification" && "获客成功"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Stacked Lead Notifications */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col-reverse gap-2 pointer-events-none">
        <AnimatePresence>
          {demoNotifications.map((leadIndex, arrayIndex) => {
            const lead = DEMO_LEADS[leadIndex];
            const stackIndex = demoNotifications.length - 1 - arrayIndex; // 0 = bottom, 2 = top
            const isTop = stackIndex === demoNotifications.length - 1;
            
            return (
              <motion.div
                key={`${leadIndex}-${arrayIndex}`}
                initial={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
                animate={{ 
                  opacity: 1 - (stackIndex * 0.15), // Lower opacity for cards behind
                  scale: 1 - (stackIndex * 0.05),   // Smaller scale for cards behind
                  y: -stackIndex * 12,               // Stack upward
                  x: -stackIndex * 8,                // Slight left offset
                  rotateZ: stackIndex * 2,           // Slight rotation
                  zIndex: 50 - stackIndex,
                }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  delay: arrayIndex * 0.1 
                }}
                className="pointer-events-auto"
                style={{ 
                  marginBottom: stackIndex > 0 ? -60 : 0,
                }}
              >
                <div 
                  className={`bg-white rounded-2xl shadow-2xl border-2 overflow-hidden w-80 transition-all duration-300 ${
                    isTop ? 'border-green-400 shadow-green-200' : 'border-gray-200'
                  }`}
                >
                  {/* Header */}
                  <div className={`px-4 py-2.5 flex items-center justify-between ${
                    isTop 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-green-400/80 to-emerald-500/80'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-white font-semibold text-sm">🎉 获得新询盘 #{leadIndex + 1}</span>
                    </div>
                    <button 
                      onClick={() => {
                        // Remove this specific notification
                        setDemoNotifications(prev => prev.filter((_, i) => i !== arrayIndex));
                        if (demoNotifications.length <= 1) {
                          setShowLeadNotification(false);
                        }
                      }}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{lead.company}</h4>
                        <p className="text-xs text-gray-500 truncate">{lead.location}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 truncate">{lead.contactName}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">采购经理</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600">AI评分:</span>
                        <span className="font-semibold text-green-600">{lead.score}/100</span>
                        <span className="text-[10px] text-green-600">{lead.source === 'email' ? '📧 邮件' : '🔍 SEO'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => {
                          setCurrentDemoLeadIndex(leadIndex);
                          setShowLeadDetail(true);
                        }}
                        className="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        查看详情
                      </button>
                      <button 
                        onClick={() => {
                          // Remove this specific notification
                          setDemoNotifications(prev => prev.filter((_, i) => i !== arrayIndex));
                          if (demoNotifications.length <= 1) {
                            setShowLeadNotification(false);
                          }
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        稍后
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Lead Detail Modal */}
      <AnimatePresence>
        {showLeadDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLeadDetail(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{currentDemoLead.company}</h3>
                    <p className="text-sm text-gray-500">{currentDemoLead.location} · {currentDemoLead.industry}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLeadDetail(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Score Badge */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    AI评分 {currentDemoLead.score}/100
                  </div>
                  <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                    🔥 高意向
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {currentDemoLead.source === "email" ? "📧 邮件渠道" : "🔍 SEO渠道"}
                  </div>
                </div>
                
                {/* Company Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">公司规模</p>
                    <p className="font-medium text-gray-900">{currentDemoLead.size}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">联系人</p>
                    <p className="font-medium text-gray-900">{currentDemoLead.contactName}</p>
                    <p className="text-xs text-gray-500">{currentDemoLead.email}</p>
                  </div>
                </div>
                
                {/* Interaction Timeline */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">互动时间线</h4>
                  <div className="space-y-3">
                    {currentDemoLead.interactions?.map((interaction, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 pb-3 border-b border-gray-100 last:border-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {interaction.type === "email_sent" && "📧 开发信已送达"}
                              {interaction.type === "email_opened" && "👁️ 打开邮件"}
                              {interaction.type === "email_replied" && "💬 回复邮件"}
                              {interaction.type === "site_visit" && "🌐 访问网站"}
                            </span>
                            <span className="text-xs text-gray-500">{interaction.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{interaction.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Email Content */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2">客户回复内容</p>
                  <p className="text-sm text-gray-700 italic">
                    "Hi, thanks for reaching out. Can you send me your wholesale price list and MOQ for camping tents? We're looking to expand our product line and interested in your patented designs. Also, do you offer OEM services?"
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                    💬 生成回复建议
                  </button>
                  <button className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    📧 发送邮件
                  </button>
                  <button className="px-4 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    ⏰ 提醒
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
