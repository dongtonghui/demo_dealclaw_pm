import { useState, useEffect, useCallback } from "react";

// 检测虚拟键盘状态
export function useVirtualKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      const heightDiff = window.innerHeight - visualViewport.height;
      const isKeyboardOpen = heightDiff > 100;
      
      setIsOpen(isKeyboardOpen);
      setKeyboardHeight(isKeyboardOpen ? heightDiff : 0);
    };

    visualViewport.addEventListener("resize", handleResize);
    handleResize();

    return () => visualViewport.removeEventListener("resize", handleResize);
  }, []);

  return { isOpen, keyboardHeight };
}

// 输入框聚焦时滚动到视野
export function useScrollIntoView<T extends HTMLElement>(
  shouldScroll: boolean
) {
  const ref = useCallback((node: T | null) => {
    if (node && shouldScroll) {
      setTimeout(() => {
        node.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [shouldScroll]);

  return ref;
}

// 防止 iOS 键盘收起时的跳动
export function usePreventKeyboardBounce() {
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${window.scrollY}px`;
      }
    };

    const handleBlur = () => {
      document.body.style.position = "";
      document.body.style.width = "";
      const scrollY = document.body.style.top;
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, []);
}

// 键盘快捷键
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== key) return;

      if (modifiers) {
        if (modifiers.ctrl && !e.ctrlKey && !e.metaKey) return;
        if (modifiers.alt && !e.altKey) return;
        if (modifiers.shift && !e.shiftKey) return;
        if (modifiers.meta && !e.metaKey) return;
      }

      e.preventDefault();
      callback();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, modifiers]);
}

// 输入框自适应高度
export function useAutoResize(
  minRows: number = 1,
  maxRows: number = 5
) {
  const [rows, setRows] = useState(minRows);

  const onInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = "auto";
    
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const padding = parseInt(getComputedStyle(textarea).paddingTop) +
                   parseInt(getComputedStyle(textarea).paddingBottom);
    
    const newHeight = textarea.scrollHeight - padding;
    const newRows = Math.min(
      maxRows,
      Math.max(minRows, Math.round(newHeight / lineHeight))
    );
    
    setRows(newRows);
    textarea.style.height = `${newRows * lineHeight + padding}px`;
  }, [minRows, maxRows]);

  return { rows, onInput };
}
