import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatState } from "@/hooks/useChatState";

/**
 * SEO Agent 功能测试套件
 * 覆盖: SEO-001 ~ SEO-013
 */
describe("SEO Agent - 完整功能测试", () => {
  let result: { current: ReturnType<typeof useChatState> };
  let rerender: () => void;

  beforeEach(() => {
    const hook = renderHook(() => useChatState());
    result = hook.result;
    rerender = hook.rerender;
  });

  describe("关键词推荐 (SEO-001/002)", () => {
    it("@SEO Agent 推荐关键词应返回关键词推荐卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 推荐关键词");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "keyword-recommend"
        );
      }, { timeout: 3000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "keyword-recommend"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("keywords");
      expect(cardMessage?.card?.data.keywords).toBeInstanceOf(Array);
    });

    it("关键词卡片应包含完整的关键词数据", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 推荐关键词");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "keyword-recommend"
        );
      }, { timeout: 3000 });

      rerender();

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "keyword-recommend"
      );
      const keywords = cardMessage?.card?.data.keywords;
      expect(keywords.length).toBeGreaterThan(0);
      
      const firstKeyword = keywords[0];
      expect(firstKeyword).toHaveProperty("term");
      expect(firstKeyword).toHaveProperty("volume");
      expect(firstKeyword).toHaveProperty("difficulty");
      expect(firstKeyword).toHaveProperty("intent");
    });
  });

  describe("文章编辑 (SEO-004)", () => {
    it("@SEO Agent 编辑文章应返回文章编辑卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 编辑文章");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "seo-article-edit"
        );
      }, { timeout: 3000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "seo-article-edit"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("article");
    });

    it("保存文章应更新状态", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 编辑文章");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "seo-article-edit"
        );
      }, { timeout: 3000 });

      const newArticleData = {
        title: "测试文章标题",
        content: "测试文章内容",
        metaDescription: "测试描述",
        keywords: ["test", "keyword"],
      };

      act(() => {
        result.current.handleCardAction("save-article", { article: newArticleData });
      });

      rerender();

      const savedMessage = result.current.messages.find(
        (m) => m.content?.includes("文章已保存")
      );
      expect(savedMessage).toBeDefined();
    });
  });

  describe("站点连接 (SEO-005)", () => {
    it("@SEO Agent 绑定站点应返回站点连接卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 绑定站点");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "site-connection"
        );
      }, { timeout: 3000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "site-connection"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("sites");
    });

    it("连接站点应显示成功消息", async () => {
      act(() => {
        result.current.handleCardAction("site-connected", {
          site: { id: "1", platform: "wordpress", name: "Test Site" },
        });
      });

      rerender();

      const successMessage = result.current.messages.find(
        (m) => m.content?.includes("站点连接成功")
      );
      expect(successMessage).toBeDefined();
    });
  });

  describe("文章分析 (SEO-007)", () => {
    it("@SEO Agent 文章数据应返回文章分析卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 文章数据");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "article-analytics"
        );
      }, { timeout: 3000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "article-analytics"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("articles");
    });

    it("文章分析卡片应包含文章数据", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 文章数据");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "article-analytics"
        );
      }, { timeout: 3000 });

      rerender();

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "article-analytics"
      );
      const articles = cardMessage?.card?.data.articles;
      expect(articles).toBeInstanceOf(Array);
      expect(articles.length).toBeGreaterThan(0);
      
      const firstArticle = articles[0];
      expect(firstArticle).toHaveProperty("title");
      expect(firstArticle).toHaveProperty("totalViews");
      expect(firstArticle).toHaveProperty("ranking");
    });
  });

  describe("竞品分析 (SEO-008)", () => {
    it("@SEO Agent 竞品分析应返回竞品分析卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 竞品分析");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "competitor-analysis"
        );
      }, { timeout: 3000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "competitor-analysis"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("competitors");
      expect(cardMessage?.card?.data).toHaveProperty("keywordGaps");
    });

    it("竞品分析卡片应包含竞争对手数据", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 竞品分析");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "competitor-analysis"
        );
      }, { timeout: 3000 });

      rerender();

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "competitor-analysis"
      );
      const competitors = cardMessage?.card?.data.competitors;
      expect(competitors).toBeInstanceOf(Array);
      expect(competitors.length).toBeGreaterThan(0);
      
      const firstCompetitor = competitors[0];
      expect(firstCompetitor).toHaveProperty("domain");
      expect(firstCompetitor).toHaveProperty("domainAuthority");
      expect(firstCompetitor).toHaveProperty("weaknesses");
      expect(firstCompetitor).toHaveProperty("opportunities");
    });
  });

  describe("一键建站 (SEO-009)", () => {
    it("@SEO Agent 生成站点应返回站点生成卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 生成站点");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "site-generator"
        );
      }, { timeout: 3000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "site-generator"
      );
      expect(cardMessage).toBeDefined();
    });
  });

  describe("健康检查 (SEO-013)", () => {
    it("@SEO Agent 健康检查应返回健康检查卡片", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 健康检查");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "seo-health"
        );
      }, { timeout: 3000 });

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "seo-health"
      );
      expect(cardMessage).toBeDefined();
      expect(cardMessage?.card?.data).toHaveProperty("siteHealth");
    });

    it("健康检查卡片应包含检查数据", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 健康检查");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "seo-health"
        );
      }, { timeout: 3000 });

      rerender();

      const cardMessage = result.current.messages.find(
        (m) => m.card?.type === "seo-health"
      );
      const siteHealth = cardMessage?.card?.data.siteHealth;
      expect(siteHealth).toHaveProperty("overallScore");
      expect(siteHealth).toHaveProperty("status");
      expect(siteHealth).toHaveProperty("checks");
      expect(siteHealth).toHaveProperty("metrics");
    });

    it("修复所有问题应显示成功消息", async () => {
      act(() => {
        result.current.handleCardAction("fix-all-issues");
      });

      rerender();

      const fixMessage = result.current.messages.find(
        (m) => m.content?.includes("正在自动修复") || m.content?.includes("已修复")
      );
      expect(fixMessage).toBeDefined();
    });
  });

  describe("意图识别", () => {
    const seoCommands = [
      { cmd: "@SEO Agent 编辑文章", expectedType: "seo-article-edit" },
      { cmd: "@SEO Agent 绑定站点", expectedType: "site-connection" },
      { cmd: "@SEO Agent 文章数据", expectedType: "article-analytics" },
      { cmd: "@SEO Agent 竞品分析", expectedType: "competitor-analysis" },
      { cmd: "@SEO Agent 生成站点", expectedType: "site-generator" },
      { cmd: "@SEO Agent 健康检查", expectedType: "seo-health" },
      { cmd: "@SEO Agent 推荐关键词", expectedType: "keyword-recommend" },
    ];

    seoCommands.forEach(({ cmd, expectedType }) => {
      it(`应识别"${cmd}"意图`, async () => {
        act(() => {
          result.current.sendMessage(cmd);
        });

        await waitFor(() => {
          rerender();
          return result.current.messages.some(
            (m) => m.card?.type === expectedType
          );
        }, { timeout: 3000 });

        const cardMessage = result.current.messages.find(
          (m) => m.card?.type === expectedType
        );
        expect(cardMessage).toBeDefined();
      });
    });
  });

  describe("边界测试", () => {
    it("取消文章编辑应返回文章预览", async () => {
      act(() => {
        result.current.sendMessage("@SEO Agent 编辑文章");
      });

      await waitFor(() => {
        rerender();
        return result.current.messages.some(
          (m) => m.card?.type === "seo-article-edit"
        );
      }, { timeout: 3000 });

      act(() => {
        result.current.handleCardAction("cancel-edit");
      });

      rerender();

      const cancelMessage = result.current.messages.find(
        (m) => m.content?.includes("已取消编辑")
      );
      expect(cancelMessage).toBeDefined();
    });

    it("导出关键词应显示成功消息", async () => {
      act(() => {
        result.current.handleCardAction("export-keywords", { keywords: ["test"] });
      });

      rerender();

      const exportMessage = result.current.messages.find(
        (m) => m.content?.includes("关键词列表已导出")
      );
      expect(exportMessage).toBeDefined();
    });

    it("扫描完成应显示成功消息", async () => {
      act(() => {
        result.current.handleCardAction("scan-complete");
      });

      rerender();

      const scanMessage = result.current.messages.find(
        (m) => m.content?.includes("扫描完成")
      );
      expect(scanMessage).toBeDefined();
    });
  });
});
