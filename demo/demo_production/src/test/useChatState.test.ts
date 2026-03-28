import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatState } from "@/hooks/useChatState";

describe("useChatState - 完整功能测试", () => {
  let result: { current: ReturnType<typeof useChatState> };
  let rerender: () => void;

  beforeEach(() => {
    const hook = renderHook(() => useChatState());
    result = hook.result;
    rerender = hook.rerender;
  });

  describe("初始状态", () => {
    it("应显示正确的初始欢迎消息", () => {
      const messages = result.current.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe("agent");
      expect(messages[0].agent).toBe("supervisor");
      expect(messages[0].content).toContain("你好");
    });

    it("初始Agent状态应正确", () => {
      const statuses = result.current.agentStatuses;
      expect(statuses).toHaveLength(5);
      expect(statuses[0].agent).toBe("supervisor");
      expect(statuses[0].status).toBe("working");
    });

    it("初始数据状态应为空或默认值", () => {
      expect(result.current.companyProfile).toBeNull();
      expect(result.current.customerPersona).toBeNull();
      expect(result.current.activeTask).toBe("onboarding");
    });
  });

  describe("BUG FIX-001: 空消息处理", () => {
    it("空字符串不应发送消息", async () => {
      const beforeCount = result.current.messages.length;
      
      act(() => {
        result.current.sendMessage("");
      });

      // Force re-render to get latest state
      rerender();
      
      const afterCount = result.current.messages.length;
      expect(afterCount).toBe(beforeCount);
    });

    it("仅空格消息不应发送", async () => {
      const beforeCount = result.current.messages.length;
      
      act(() => {
        result.current.sendMessage("   ");
      });

      rerender();
      
      const afterCount = result.current.messages.length;
      expect(afterCount).toBe(beforeCount);
    });

    it("包含空格的有效消息应发送并去除前后空格", async () => {
      act(() => {
        result.current.sendMessage("  帮助  ");
      });

      rerender();

      const messages = result.current.messages;
      const userMessage = messages.find((m) => m.role === "user");
      expect(userMessage).toBeDefined();
      expect(userMessage?.content).toBe("帮助");
    });
  });

  describe("Onboarding流程", () => {
    it("输入行业信息应触发追问", async () => {
      act(() => {
        result.current.sendMessage("我们是做户外用品的");
      });

      await waitFor(() => {
        rerender();
        const messages = result.current.messages;
        const lastMessage = messages[messages.length - 1];
        return lastMessage?.role === "agent" && lastMessage?.content?.includes("出口");
      }, { timeout: 2000 });
    });

    it("BUG FIX-002: 输入市场信息应触发企业画像卡片（意图识别）", async () => {
      act(() => {
        result.current.sendMessage("主要出口美国和欧洲");
      });

      await waitFor(() => {
        rerender();
        const messages = result.current.messages;
        return messages.some((m) => m.card?.type === "company-profile");
      }, { timeout: 2000 });

      rerender();
      
      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "company-profile"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("category");
      expect(cardMessage?.card?.data).toHaveProperty("market");
    });

    it("确认画像后应进入任务创建阶段", async () => {
      // First trigger profile creation
      act(() => {
        result.current.sendMessage("美国");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "company-profile"
        );
      }, { timeout: 2000 });

      // Then confirm
      act(() => {
        result.current.handleCardAction("confirm-profile");
      });

      await waitFor(() => {
        rerender();
        const messages = result.current.messages;
        const lastMessage = messages[messages.length - 1];
        return lastMessage?.role === "agent" && lastMessage?.content?.includes("获客目标");
      }, { timeout: 1500 });
    });
  });

  describe("创建获客任务", () => {
    it("输入获客目标应触发追问", async () => {
      act(() => {
        result.current.sendMessage("帮我找美国户外用品批发商");
      });

      await waitFor(() => {
        rerender();
        const messages = result.current.messages;
        const lastMessage = messages[messages.length - 1];
        return lastMessage?.role === "agent" && lastMessage?.content?.includes("确认");
      }, { timeout: 2000 });
    });

    it("输入采购规模应触发客户画像卡片", async () => {
      act(() => {
        result.current.sendMessage("年采购100-500万美元");
      });

      await waitFor(() => {
        rerender();
        const messages = result.current.messages;
        return messages.some((m) => m.card?.type === "customer-persona");
      }, { timeout: 2000 });

      rerender();
      
      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "customer-persona"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("region");
    });
  });

  describe("查询功能", () => {
    it("输入'进展'应返回任务进度卡片", async () => {
      act(() => {
        result.current.sendMessage("任务进展如何");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "task-progress"
        );
      }, { timeout: 2000 });

      rerender();

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "task-progress"
      );
      expect(cardMessage?.card?.data).toHaveProperty("seo");
      expect(cardMessage?.card?.data).toHaveProperty("email");
    });

    it("输入'线索'应返回线索摘要卡片", async () => {
      act(() => {
        result.current.sendMessage("查看线索");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "lead-summary"
        );
      }, { timeout: 2000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "lead-summary"
      );
      expect(cardMessage?.card?.data).toHaveProperty("leads");
    });

    it("输入'效果'应返回数据看板卡片", async () => {
      act(() => {
        result.current.sendMessage("本周效果如何");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "data-dashboard"
        );
      }, { timeout: 2000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "data-dashboard"
      );
      expect(cardMessage?.card?.data).toHaveProperty("leads");
    });

    it("输入'帮助'应返回帮助信息", async () => {
      act(() => {
        result.current.sendMessage("帮助");
      });

      await waitFor(() => {
        rerender();
        const messages = result.current.messages;
        const lastMessage = messages[messages.length - 1];
        return lastMessage?.content?.includes("我可以帮您");
      }, { timeout: 1500 });
    });
  });

  describe("@Agent命令", () => {
    it("@SEO Agent关键词应返回SEO策略", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 关键词");
      });

      await waitFor(() => {
        rerender();
        const messages = result.current.messages;
        return messages.some((m) => m.agent === "seo" && m.card?.type === "seo-strategy");
      }, { timeout: 2000 });

      const seoMessage = result.current.messages.find(
        (m) => m.agent === "seo" && m.card?.type === "seo-strategy"
      );
      expect(seoMessage).toBeDefined();
    });

    it("@SEO Agent生成文章应返回文章卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 生成文章");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "seo-article"
        );
      }, { timeout: 2000 });
    });

    it("BUG FIX-003: @Email Agent客户应返回客户列表卡片", async () => {
      act(() => {
        result.current.sendMessage("@Email Agent 客户");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "customer-list"
        );
      }, { timeout: 2000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "customer-list"
      );
      expect(cardMessage).toBeDefined();
    });

    it("@Email Agent预览邮件应返回邮件预览卡片", async () => {
      act(() => {
        result.current.sendMessage("@Email Agent 预览邮件");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "email-preview"
        );
      }, { timeout: 2000 });
    });
  });

  describe("BUG FIX-004: 卡片编辑功能", () => {
    it("点击edit-profile应显示编辑表单", async () => {
      act(() => {
        result.current.handleCardAction("edit-profile");
      });

      rerender();

      const editMessage = result.current.messages.find(
        (m) => m.card?.type === "company-profile-edit"
      );
      expect(editMessage).toBeDefined();
    });

    it("保存企业画像应更新状态", async () => {
      const newData = {
        category: "电子产品",
        advantage: "自主研发",
        market: "东南亚",
        targetCustomer: "零售商",
        priceRange: "中端",
      };

      act(() => {
        result.current.handleCardAction("save-profile", newData);
      });

      rerender();

      // The message should be added
      const savedMessage = result.current.messages.find(
        (m) => m.content?.includes("企业画像已更新") || m.content?.includes("✅")
      );
      expect(savedMessage).toBeDefined();
    });

    it("点击edit-persona应显示编辑表单", async () => {
      act(() => {
        result.current.handleCardAction("edit-persona");
      });

      rerender();

      const editMessage = result.current.messages.find(
        (m) => m.card?.type === "customer-persona-edit"
      );
      expect(editMessage).toBeDefined();
    });
  });

  describe("BUG FIX-005: 文件上传功能", () => {
    it("handleFileUpload应处理文件并显示解析结果", async () => {
      const files = [
        { name: "product-catalog.pdf", size: "2.5 MB", type: "application/pdf" },
      ];

      act(() => {
        result.current.handleFileUpload(files);
      });

      rerender();

      // Check user message was added
      const userMessage = result.current.messages.find(
        (m) => m.role === "user" && m.content?.includes("product-catalog")
      );
      expect(userMessage).toBeDefined();

      // Wait for parsing result
      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.content?.includes("文档解析完成")
        );
      }, { timeout: 3000 });
    });
  });

  describe("边界测试", () => {
    it("超长消息应正常处理", async () => {
      const longMessage = "A".repeat(1000);

      act(() => {
        result.current.sendMessage(longMessage);
      });

      rerender();

      const userMessage = result.current.messages.find(
        (m) => m.content === longMessage
      );
      expect(userMessage).toBeDefined();
    });

    it("特殊字符应正常处理", async () => {
      const specialMessage = "Hello <>{}[] special chars!";

      act(() => {
        result.current.sendMessage(specialMessage);
      });

      rerender();

      const userMessage = result.current.messages.find(
        (m) => m.content === specialMessage
      );
      expect(userMessage).toBeDefined();
    });
  });
});
