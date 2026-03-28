import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatState } from "@/hooks/useChatState";

describe("Bug Fixes 验证测试", () => {
  let result: { current: ReturnType<typeof useChatState> };
  let rerender: () => void;

  beforeEach(() => {
    const hook = renderHook(() => useChatState());
    result = hook.result;
    rerender = hook.rerender;
  });

  describe("BUG FIX-001: 空消息处理", () => {
    it("空字符串不应发送消息", () => {
      const beforeCount = result.current.messages.length;
      
      act(() => {
        result.current.sendMessage("");
      });

      rerender();
      expect(result.current.messages.length).toBe(beforeCount);
    });

    it("仅空格消息不应发送", () => {
      const beforeCount = result.current.messages.length;
      
      act(() => {
        result.current.sendMessage("   ");
      });

      rerender();
      expect(result.current.messages.length).toBe(beforeCount);
    });

    it("包含空格的有效消息应去除前后空格", () => {
      act(() => {
        result.current.sendMessage("  帮助  ");
      });

      rerender();

      const userMessage = result.current.messages.find((m) => m.role === "user");
      expect(userMessage?.content).toBe("帮助");
    });
  });

  describe("BUG FIX-002: 意图识别系统", () => {
    it("应识别'帮助'意图", async () => {
      act(() => {
        result.current.sendMessage("帮助");
      });

      // Wait for async response
      await new Promise((r) => setTimeout(r, 1500));
      rerender();

      const messages = result.current.messages;
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage.role).toBe("agent");
      expect(lastMessage.content).toContain("我可以帮您");
    });

    it("应识别'@SEO Agent 生成文章'意图", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 生成文章");
      });

      await new Promise((r) => setTimeout(r, 1500));
      rerender();

      const messages = result.current.messages;
      const hasSEOCard = messages.some(
        (m) => m.agent === "seo" && m.card?.type === "seo-article"
      );
      expect(hasSEOCard).toBe(true);
    });

    it("应识别'@Email Agent 预览邮件'意图", async () => {
      act(() => {
        result.current.sendMessage("@Email Agent 预览邮件");
      });

      await new Promise((r) => setTimeout(r, 1500));
      rerender();

      const messages = result.current.messages;
      const hasEmailCard = messages.some(
        (m) => m.agent === "email" && m.card?.type === "email-preview"
      );
      expect(hasEmailCard).toBe(true);
    });
  });

  describe("BUG FIX-004: 编辑功能", () => {
    it("应显示企业画像编辑表单", () => {
      act(() => {
        result.current.handleCardAction("edit-profile");
      });

      rerender();

      const editMessage = result.current.messages.find(
        (m) => m.card?.type === "company-profile-edit"
      );
      expect(editMessage).toBeDefined();
      expect(editMessage?.card?.actions).toContainEqual(
        expect.objectContaining({ id: "save-profile" })
      );
    });

    it("应显示客户画像编辑表单", () => {
      act(() => {
        result.current.handleCardAction("edit-persona");
      });

      rerender();

      const editMessage = result.current.messages.find(
        (m) => m.card?.type === "customer-persona-edit"
      );
      expect(editMessage).toBeDefined();
    });

    it("取消编辑应关闭表单", () => {
      act(() => {
        result.current.handleCardAction("edit-profile");
      });
      
      rerender();
      
      const beforeCount = result.current.messages.length;
      
      act(() => {
        result.current.handleCardAction("cancel-edit");
      });

      rerender();

      const afterCount = result.current.messages.length;
      expect(afterCount).toBeGreaterThan(beforeCount);
    });
  });

  describe("BUG FIX-005: 文件上传", () => {
    it("应处理文件上传并添加用户消息", async () => {
      const files = [
        { name: "product-catalog.pdf", size: "2.5 MB", type: "application/pdf" },
      ];

      act(() => {
        result.current.handleFileUpload(files);
      });

      rerender();

      const userMessage = result.current.messages.find(
        (m) => m.role === "user" && m.content.includes("product-catalog")
      );
      expect(userMessage).toBeDefined();

      // Wait for parsing
      await new Promise((r) => setTimeout(r, 3000));
      rerender();

      const parseMessage = result.current.messages.find(
        (m) => m.content.includes("文档解析完成")
      );
      expect(parseMessage).toBeDefined();
    });
  });

  describe("BUG FIX-007: 防抖处理", () => {
    it("快速连续发送应被节流", async () => {
      act(() => {
        result.current.sendMessage("第一条消息");
      });

      // Try to send immediately again (should be blocked by processing ref)
      act(() => {
        result.current.sendMessage("第二条消息");
      });

      rerender();

      // Count user messages (should be 1 due to debounce)
      const userMessages = result.current.messages.filter(
        (m) => m.role === "user"
      );
      expect(userMessages.length).toBe(1);
      expect(userMessages[0].content).toBe("第一条消息");
    });
  });
});
