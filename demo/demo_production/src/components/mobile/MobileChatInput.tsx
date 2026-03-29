import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Mic, X, Plus, Bot, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileChatInputProps {
  onSendMessage: (text: string) => void;
  onFileUpload?: (files: { name: string; size: string; type: string }[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const AGENT_MENTIONS = [
  { id: "seo", name: "SEO Agent", emoji: "🔍", command: "@SEO Agent " },
  { id: "email", name: "Email Agent", emoji: "✉️", command: "@Email Agent " },
  { id: "whatsapp", name: "WhatsApp Agent", emoji: "💬", command: "@WhatsApp Agent " },
];

const QUICK_ACTIONS = [
  { label: "查看线索", icon: "🎯", command: "查看线索" },
  { label: "任务进展", icon: "📊", command: "任务进展如何" },
  { label: "本周效果", icon: "📈", command: "本周效果如何" },
  { label: "生成文章", icon: "📝", command: "@SEO Agent 生成文章" },
];

export function MobileChatInput({
  onSendMessage,
  onFileUpload,
  disabled,
  placeholder = "有什么可以帮你的？",
}: MobileChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, [input]);

  // Handle input with mention detection
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for @ mention
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
    } else if (!value.includes("@")) {
      setShowMentions(false);
    }
  };

  // Handle send
  const handleSend = useCallback(() => {
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim());
    setInput("");
    setShowMentions(false);
    setShowActions(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, disabled, onSendMessage]);

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle mention select
  const handleMentionSelect = (command: string) => {
    const newInput = input + command.replace("@", "");
    setInput(newInput);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      if (onFileUpload) {
        onFileUpload(
          selectedFiles.map((f) => ({
            name: f.name,
            size: formatFileSize(f.size),
            type: f.type,
          }))
        );
      }
    }
  };

  // Handle voice recording
  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        setInput("帮我找美国户外用品批发商");
      }, 3000);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = input.trim().length > 0 && !disabled;

  return (
    <div className="px-3 py-3">
      {/* Quick Actions */}
      <AnimatePresence>
        {showActions && !isFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.command}
                  onClick={() => {
                    onSendMessage(action.command);
                    setShowActions(false);
                  }}
                  disabled={disabled}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full
                           bg-muted text-xs whitespace-nowrap shrink-0
                           active:bg-muted/80 transition-colors"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mention Popup */}
      <AnimatePresence>
        {showMentions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 right-4 mb-2 z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  选择 Agent
                </span>
              </div>
              <div className="py-1">
                {AGENT_MENTIONS.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleMentionSelect(agent.command)}
                    className="w-full px-3 py-3 flex items-center gap-3 text-left
                             hover:bg-muted/50 active:bg-muted transition-colors"
                  >
                    <span className="text-lg">{agent.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{agent.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 shrink-0"
                >
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 flex items-center justify-center gap-2 text-sm text-red-500"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>正在录音...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div
        className={cn(
          "flex items-end gap-2 bg-muted rounded-2xl px-3 py-2",
          "transition-shadow duration-200",
          isFocused && "ring-2 ring-primary/20"
        )}
      >
        {/* Left Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              showActions ? "bg-primary/20 text-primary" : "text-muted-foreground"
            )}
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground
                     active:bg-muted transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            setShowActions(false);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled || isRecording}
          rows={1}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground
                   outline-none resize-none min-h-[36px] max-h-[120px] py-2"
        />

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!input.trim() ? (
            <button
              onClick={handleRecord}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                isRecording
                  ? "bg-red-500/20 text-red-500"
                  : "text-muted-foreground active:bg-muted"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                canSend
                  ? "bg-primary text-primary-foreground active:scale-95"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
