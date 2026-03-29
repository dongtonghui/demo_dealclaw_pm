import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Mic, FileText, X, Upload, HelpCircle, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/hooks/useChatState";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onCardAction: (actionId: string, data?: Record<string, any>) => void;
  onFileUpload?: (files: { name: string; size: string; type: string }[]) => void;
  isTyping: boolean;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

interface AgentMention {
  id: string;
  name: string;
  emoji: string;
  description: string;
  command: string;
}

const AGENT_MENTIONS: AgentMention[] = [
  { id: "seo", name: "SEO Agent", emoji: "🔍", description: "关键词、文章、站点优化", command: "@SEO Agent " },
  { id: "email", name: "Email Agent", emoji: "✉️", description: "客户筛选、邮件发送", command: "@Email Agent " },
  { id: "whatsapp", name: "WhatsApp Agent", emoji: "💬", description: "消息管理、对话跟进", command: "@WhatsApp Agent " },
];

// Debounce hook for preventing rapid submissions
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  onCardAction, 
  onFileUpload,
  isTyping 
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionStartRef = useRef<number>(-1);
  const mentionPopupRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Close mention popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionPopupRef.current &&
        !mentionPopupRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowMentionPopup(false);
        mentionStartRef.current = -1;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced submit handler (BUG FIX-007: Debounce rapid submissions)
  const debouncedSubmit = useDebounce((text: string) => {
    onSendMessage(text);
    setIsSubmitting(false);
  }, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // BUG FIX-001: Enhanced validation for empty messages
    const trimmedInput = input.trim();
    const hasValidInput = trimmedInput.length > 0;
    const hasFiles = uploadedFiles.length > 0;
    
    if (!hasValidInput && !hasFiles) return;
    if (isSubmitting) return; // Prevent duplicate submissions
    
    setIsSubmitting(true);
    
    // Build message text
    let messageText = trimmedInput;
    if (hasFiles) {
      const fileNames = uploadedFiles.map(f => `[${f.name}]`).join(" ");
      messageText = hasValidInput 
        ? `${trimmedInput} ${fileNames}` 
        : `上传了文件: ${fileNames}`;
    }
    
    // Clear input immediately for better UX
    setInput("");
    setUploadedFiles([]);
    setShowUploadZone(false);
    
    // Handle file upload if present
    if (hasFiles && onFileUpload) {
      onFileUpload(uploadedFiles);
    } else {
      // Use debounced submit
      debouncedSubmit(messageText);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setShowUploadZone(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMicClick = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate voice recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setInput("帮我找美国户外用品批发商");
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleHelpClick = () => {
    onSendMessage("帮助");
  };

  // Handle input change with @mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setInput(value);

    // Check for @mention
    const lastAtIndex = value.lastIndexOf("@", cursorPosition - 1);
    
    if (lastAtIndex !== -1 && lastAtIndex === mentionStartRef.current) {
      // User is typing after @
      const query = value.substring(lastAtIndex + 1, cursorPosition);
      setMentionQuery(query);
      setShowMentionPopup(true);
      
      // Filter mentions based on query
      const filtered = AGENT_MENTIONS.filter(agent => 
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.id.toLowerCase().includes(query.toLowerCase())
      );
      
      // Reset selection if out of bounds
      if (selectedMentionIndex >= filtered.length) {
        setSelectedMentionIndex(0);
      }
    } else if (lastAtIndex !== -1) {
      // New @ detected
      const query = value.substring(lastAtIndex + 1, cursorPosition);
      // Only show if no space in query (still typing agent name)
      if (!query.includes(" ")) {
        mentionStartRef.current = lastAtIndex;
        setMentionQuery(query);
        setShowMentionPopup(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionPopup(false);
        mentionStartRef.current = -1;
      }
    } else {
      // No @ detected
      setShowMentionPopup(false);
      mentionStartRef.current = -1;
    }
  };

  // Handle mention selection
  const handleMentionSelect = (agent: AgentMention) => {
    if (mentionStartRef.current !== -1) {
      const beforeMention = input.substring(0, mentionStartRef.current);
      const afterMention = input.substring(mentionStartRef.current + mentionQuery.length + 1);
      const newInput = beforeMention + agent.command + afterMention;
      setInput(newInput);
      setShowMentionPopup(false);
      setMentionQuery("");
      mentionStartRef.current = -1;
      
      // Focus input after selection
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Handle keyboard navigation for mentions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMentionPopup) return;

    const filteredMentions = AGENT_MENTIONS.filter(agent => 
      agent.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      agent.id.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredMentions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredMentions.length > 0) {
          handleMentionSelect(filteredMentions[selectedMentionIndex]);
        }
        break;
      case "Escape":
        setShowMentionPopup(false);
        mentionStartRef.current = -1;
        break;
    }
  };

  // Get filtered mentions
  const filteredMentions = AGENT_MENTIONS.filter(agent => 
    agent.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    agent.id.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const quickCommands = [
    { label: "查看线索", icon: "🎯", command: "查看线索" },
    { label: "任务进展", icon: "📊", command: "任务进展如何" },
    { label: "本周效果", icon: "📈", command: "本周效果如何" },
    { label: "生成文章", icon: "📝", command: "@SEO Agent 生成文章" },
  ];

  const canSubmit = input.trim().length > 0 || uploadedFiles.length > 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background">
      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">🤖 主管 Agent</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">在线</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleHelpClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="查看帮助"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">按</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">Enter</kbd>
          <span className="text-xs text-muted-foreground">发送</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <MessageBubble message={msg} onCardAction={onCardAction} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-muted-foreground text-sm"
              >
                <span className="text-agent-supervisor">🤖</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "200ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "400ms" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Commands - only show after onboarding */}
          {messages.length > 5 && !isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {quickCommands.map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => onSendMessage(cmd.command)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <span>{cmd.icon}</span>
                  <span>{cmd.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <AnimatePresence>
        {showUploadZone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-3"
          >
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="max-w-2xl mx-auto border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">点击或拖拽上传文件</p>
              <p className="text-xs text-muted-foreground/60 mt-1">支持 PDF、Word、图片等格式</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="px-6 pb-3">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground truncate max-w-[150px]">{file.name}</span>
                <span className="text-xs text-muted-foreground">({file.size})</span>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="px-6 pb-3">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 text-sm text-primary">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>正在录音...</span>
            <span className="text-muted-foreground">（3秒后自动结束）</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 relative">
        {/* @mention Popup */}
        <AnimatePresence>
          {showMentionPopup && filteredMentions.length > 0 && (
            <motion.div
              ref={mentionPopupRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 right-0 mb-2 max-w-2xl mx-auto z-50"
            >
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/50 border-b border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    选择 Agent（↑↓ 选择，Enter 确认，Esc 关闭）
                  </span>
                </div>
                <div className="max-h-[180px] overflow-y-auto py-1">
                  {filteredMentions.map((agent, index) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleMentionSelect(agent)}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                        index === selectedMentionIndex
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-lg">{agent.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {agent.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.description}
                        </p>
                      </div>
                      {index === selectedMentionIndex && (
                        <span className="text-xs text-primary">↵</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:shadow-[var(--shadow-glow)] transition-all">
            <button 
              type="button" 
              onClick={() => setShowUploadZone(!showUploadZone)}
              disabled={isSubmitting}
              className={`text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 ${showUploadZone ? "text-primary" : ""}`}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="有什么可以帮你的？（输入 @ 召唤 Agent）"
              disabled={isSubmitting}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
            />
            <button 
              type="button" 
              onClick={handleMicClick}
              disabled={isSubmitting}
              className={`transition-colors disabled:opacity-50 ${isRecording ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
            DealClaw AI 可能会产生不准确的信息，请注意核实
          </p>
        </form>
      </div>
    </div>
  );
}
