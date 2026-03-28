import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompanyProfileCard } from "@/components/dealclaw/cards/CompanyProfileCard";
import { CompanyProfileEditCard } from "@/components/dealclaw/cards/CompanyProfileEditCard";
import { CustomerPersonaCard } from "@/components/dealclaw/cards/CustomerPersonaCard";
import { CustomerPersonaEditCard } from "@/components/dealclaw/cards/CustomerPersonaEditCard";
import { AcquisitionPlanCard } from "@/components/dealclaw/cards/AcquisitionPlanCard";

describe("组件渲染测试", () => {
  describe("CompanyProfileCard - 企业画像卡片", () => {
    const mockCard = {
      type: "company-profile" as const,
      data: {
        category: "户外用品（帐篷/睡袋）",
        advantage: "自有工厂、OEM定制",
        market: "北美、欧洲",
        targetCustomer: "批发商、品牌商",
        priceRange: "中高端",
      },
      actions: [
        { label: "编辑修改", id: "edit-profile", variant: "secondary" as const },
        { label: "确认无误", id: "confirm-profile", variant: "primary" as const },
      ],
    };

    it("应正确渲染所有字段", () => {
      render(<CompanyProfileCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText("企业画像 - AI理解确认")).toBeInTheDocument();
      // BUG FIX-006: Use regex to match text with special characters
      expect(screen.getByText(/产品类别/)).toBeInTheDocument();
      expect(screen.getByText("户外用品（帐篷/睡袋）")).toBeInTheDocument();
      expect(screen.getByText(/核心优势/)).toBeInTheDocument();
      expect(screen.getByText("自有工厂、OEM定制")).toBeInTheDocument();
    });

    it("应渲染操作按钮", () => {
      render(<CompanyProfileCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText("编辑修改")).toBeInTheDocument();
      expect(screen.getByText("确认无误")).toBeInTheDocument();
    });

    it("点击按钮应触发回调", () => {
      const onAction = vi.fn();
      render(<CompanyProfileCard card={mockCard} onAction={onAction} />);
      
      fireEvent.click(screen.getByText("确认无误"));
      expect(onAction).toHaveBeenCalledWith("confirm-profile");
    });
  });

  describe("CompanyProfileEditCard - 企业画像编辑卡片", () => {
    const mockCard = {
      type: "company-profile-edit" as const,
      data: {
        category: "户外用品",
        advantage: "自有工厂",
        market: "北美",
        targetCustomer: "批发商",
        priceRange: "中高端",
      },
      actions: [
        { label: "取消", id: "cancel-edit", variant: "secondary" as const },
        { label: "保存", id: "save-profile", variant: "primary" as const },
      ],
    };

    it("应渲染编辑表单", () => {
      render(<CompanyProfileEditCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText("编辑企业画像")).toBeInTheDocument();
      expect(screen.getByDisplayValue("户外用品")).toBeInTheDocument();
      expect(screen.getByDisplayValue("自有工厂")).toBeInTheDocument();
    });

    it("编辑后应触发保存回调", () => {
      const onAction = vi.fn();
      render(<CompanyProfileEditCard card={mockCard} onAction={onAction} />);
      
      const input = screen.getByDisplayValue("户外用品");
      fireEvent.change(input, { target: { value: "电子产品" } });
      
      fireEvent.click(screen.getByText("保存"));
      expect(onAction).toHaveBeenCalledWith("save-profile", expect.objectContaining({
        category: "电子产品",
      }));
    });
  });

  describe("CustomerPersonaCard - 客户画像卡片", () => {
    const mockCard = {
      type: "customer-persona" as const,
      data: {
        region: "美国",
        industry: "户外用品批发",
        scale: "中型（50-200人）",
        purchaseVolume: "100万-500万美元/年",
        decisionMaker: "采购经理/采购总监",
        timeline: "3个月内",
      },
      actions: [
        { label: "编辑", id: "edit-persona", variant: "secondary" as const },
        { label: "确认无误", id: "confirm-persona", variant: "primary" as const },
      ],
    };

    it("应正确渲染所有字段", () => {
      render(<CustomerPersonaCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText("目标客户画像")).toBeInTheDocument();
      expect(screen.getByText("美国")).toBeInTheDocument();
      expect(screen.getByText("户外用品批发")).toBeInTheDocument();
    });
  });

  describe("CustomerPersonaEditCard - 客户画像编辑卡片", () => {
    const mockCard = {
      type: "customer-persona-edit" as const,
      data: {
        region: "美国",
        industry: "户外用品",
        scale: "中型",
        purchaseVolume: "100万美元",
        decisionMaker: "采购经理",
        timeline: "3个月",
      },
      actions: [
        { label: "取消", id: "cancel-edit", variant: "secondary" as const },
        { label: "保存", id: "save-persona", variant: "primary" as const },
      ],
    };

    it("应渲染编辑表单", () => {
      render(<CustomerPersonaEditCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText("编辑客户画像")).toBeInTheDocument();
      expect(screen.getByDisplayValue("美国")).toBeInTheDocument();
      expect(screen.getByDisplayValue("户外用品")).toBeInTheDocument();
    });
  });

  describe("AcquisitionPlanCard - 获客方案卡片", () => {
    const mockCard = {
      type: "acquisition-plan" as const,
      data: {
        seo: {
          mode: "AI建站（推荐）",
          keywords: "wholesale camping gear",
          contentPlan: "每周2篇行业文章",
          expectedLeads: "8条/月",
        },
        email: {
          channel: "平台代发（高送达率）",
          targetCustomers: "800家精准企业",
          sendPlan: "每日30封，持续4周",
          expectedLeads: "15条/月",
        },
        summary: {
          cycle: "4-6周",
          totalLeads: "23-32条",
          costPerLead: "¥85-110/条",
          highIntent: "40-50%",
        },
      },
      actions: [
        { label: "调整配置", id: "adjust-plan", variant: "secondary" as const },
        { label: "确认执行", id: "confirm-plan", variant: "primary" as const },
      ],
    };

    it("应正确渲染SEO策略", () => {
      render(<AcquisitionPlanCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText("获客方案 - 多渠道整合")).toBeInTheDocument();
      expect(screen.getByText(/SEO Agent/)).toBeInTheDocument();
    });

    it("应正确渲染Email策略", () => {
      render(<AcquisitionPlanCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText(/Email Agent/)).toBeInTheDocument();
      expect(screen.getByText(/800家精准企业/)).toBeInTheDocument();
    });

    it("应正确渲染整体预期", () => {
      render(<AcquisitionPlanCard card={mockCard} onAction={vi.fn()} />);
      
      expect(screen.getByText("获客周期")).toBeInTheDocument();
      expect(screen.getByText("4-6周")).toBeInTheDocument();
    });
  });
});
