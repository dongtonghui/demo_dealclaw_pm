import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, FileText, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/hooks/useChatState";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onCardAction: (actionId: string) => void;
  isTyping: boolean;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

export function ChatPanel({ messages, onSendMessage, onCardAction, isTyping }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    // If files are uploaded, include in message
    let messageText = input.trim();
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map(f => `[${f.name}]`).join(" ");
      messageText = messageText ? `${messageText} ${fileNames}` : `上传了文件: ${fileNames}`;
    }
    
    onSendMessage(messageText);
    setInput("");
    setUploadedFiles([]);
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

  const quickCommands = [
    { label: "查看线索", icon: "🎯", command: "查看线索" },
    { label: "任务进展", icon: "📊", command: "任务进展如何" },
    { label: "本周效果", icon: "📈", command: "本周效果如何" },
    { label: "生成文章", icon: "📝", command: "@SEO Agent 生成文章" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background">
      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">🤖 主管 Agent</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">在线</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
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
      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:shadow-[var(--shadow-glow)] transition-all">
            <button 
              type="button" 
              onClick={() => setShowUploadZone(!showUploadZone)}
              className={`text-muted-foreground hover:text-foreground transition-colors ${showUploadZone ? "text-primary" : ""}`}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="有什么可以帮你的？"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button 
              type="button" 
              onClick={handleMicClick}
              className={`transition-colors ${isRecording ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() && uploadedFiles.length === 0}
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
