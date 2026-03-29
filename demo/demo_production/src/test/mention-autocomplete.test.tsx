import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPanel } from '@/components/dealclaw/ChatPanel';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Element.prototype.scrollTo = vi.fn();

describe('@mention 自动联想功能', () => {
  const mockOnSendMessage = vi.fn();
  const mockOnCardAction = vi.fn();
  const mockOnFileUpload = vi.fn();

  const defaultProps = {
    messages: [],
    onSendMessage: mockOnSendMessage,
    onCardAction: mockOnCardAction,
    onFileUpload: mockOnFileUpload,
    isTyping: false,
  };

  beforeEach(() => {
    mockOnSendMessage.mockClear();
    mockOnCardAction.mockClear();
    mockOnFileUpload.mockClear();
  });

  it('输入 @ 时显示 Agent 选择弹窗', async () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/);
    fireEvent.change(input, { target: { value: '@' } });

    await waitFor(() => {
      expect(screen.getByText('SEO Agent')).toBeInTheDocument();
      expect(screen.getByText('Email Agent')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp Agent')).toBeInTheDocument();
    });
  });

  it('显示 Agent 描述信息', async () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/);
    fireEvent.change(input, { target: { value: '@' } });

    await waitFor(() => {
      expect(screen.getByText('关键词、文章、站点优化')).toBeInTheDocument();
      expect(screen.getByText('客户筛选、邮件发送')).toBeInTheDocument();
      expect(screen.getByText('消息管理、对话跟进')).toBeInTheDocument();
    });
  });

  it('输入 @seo 过滤显示 SEO Agent', async () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/);
    fireEvent.change(input, { target: { value: '@seo' } });

    await waitFor(() => {
      expect(screen.getByText('SEO Agent')).toBeInTheDocument();
      expect(screen.queryByText('Email Agent')).not.toBeInTheDocument();
      expect(screen.queryByText('WhatsApp Agent')).not.toBeInTheDocument();
    });
  });

  it('输入 @email 过滤显示 Email Agent', async () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/);
    fireEvent.change(input, { target: { value: '@email' } });

    await waitFor(() => {
      expect(screen.queryByText('SEO Agent')).not.toBeInTheDocument();
      expect(screen.getByText('Email Agent')).toBeInTheDocument();
      expect(screen.queryByText('WhatsApp Agent')).not.toBeInTheDocument();
    });
  });

  it('点击 Agent 选项插入完整命令', async () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '@' } });

    await waitFor(() => {
      expect(screen.getByText('SEO Agent')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SEO Agent'));

    expect(input.value).toBe('@SEO Agent ');
  });

  it('按 Escape 关闭弹窗', async () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/);
    fireEvent.change(input, { target: { value: '@' } });

    await waitFor(() => {
      expect(screen.getByText('SEO Agent')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('SEO Agent')).not.toBeInTheDocument();
    });
  });

  it('输入空格后关闭弹窗', async () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/);
    fireEvent.change(input, { target: { value: '@SEO' } });

    await waitFor(() => {
      expect(screen.getByText('SEO Agent')).toBeInTheDocument();
    });

    // Add space after agent name - this should close the popup
    fireEvent.change(input, { target: { value: '@SEO ' } });

    await waitFor(() => {
      expect(screen.queryByText('选择 Agent')).not.toBeInTheDocument();
    });
  });

  it('显示提示文本', () => {
    render(<ChatPanel {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/输入 @ 召唤 Agent/);
    expect(input).toBeInTheDocument();
  });
});
