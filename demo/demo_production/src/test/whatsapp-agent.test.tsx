import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WhatsAppConfigCard } from '@/components/dealclaw/cards/WhatsAppConfigCard';
import { WhatsAppInboxCard } from '@/components/dealclaw/cards/WhatsAppInboxCard';

// Mock matchMedia for Radix UI components
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

describe('WhatsAppConfigCard', () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('renders WhatsApp Business account configuration form', () => {
    render(<WhatsAppConfigCard data={{}} onAction={mockOnAction} />);
    
    expect(screen.getByText('WhatsApp Business 配置')).toBeInTheDocument();
    expect(screen.getByText('Cloud API')).toBeInTheDocument();
    expect(screen.getByText('Business App')).toBeInTheDocument();
  });

  it('switches between cloud and app modes', () => {
    render(<WhatsAppConfigCard data={{}} onAction={mockOnAction} />);
    
    // Initially Cloud API is selected
    expect(screen.getByLabelText('Cloud API 密钥')).toBeInTheDocument();
    
    // Switch to Business App mode
    fireEvent.click(screen.getByText('Business App'));
    
    // API key field should not be visible in app mode
    expect(screen.queryByLabelText('Cloud API 密钥')).not.toBeInTheDocument();
  });

  it('validates phone number format', async () => {
    render(<WhatsAppConfigCard data={{}} onAction={mockOnAction} />);
    
    const phoneInput = screen.getByPlaceholderText('+86 13800138000');
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
    
    const saveButton = screen.getByText('保存配置');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入有效的手机号 (格式: +86xxxxxxxxxxx)')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<WhatsAppConfigCard data={{}} onAction={mockOnAction} />);
    
    const saveButton = screen.getByText('保存配置');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入 Cloud API 密钥')).toBeInTheDocument();
      expect(screen.getByText('请输入手机号')).toBeInTheDocument();
      expect(screen.getByText('请输入商业名称')).toBeInTheDocument();
    });
  });

  it('submits valid configuration', async () => {
    render(<WhatsAppConfigCard data={{}} onAction={mockOnAction} />);
    
    fireEvent.change(screen.getByLabelText('Cloud API 密钥'), {
      target: { value: 'test-api-key-12345' }
    });
    fireEvent.change(screen.getByPlaceholderText('+86 13800138000'), {
      target: { value: '+8613800138000' }
    });
    fireEvent.change(screen.getByLabelText('商业名称'), {
      target: { value: 'Test Company' }
    });
    
    const saveButton = screen.getByText('保存配置');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('save-whatsapp-config', expect.objectContaining({
        config: expect.objectContaining({
          apiKey: 'test-api-key-12345',
          phoneNumber: '+8613800138000',
          businessName: 'Test Company',
        }),
        mode: 'cloud'
      }));
    }, { timeout: 2000 });
  });

  it('triggers test connection', async () => {
    render(<WhatsAppConfigCard data={{}} onAction={mockOnAction} />);
    
    fireEvent.change(screen.getByLabelText('Cloud API 密钥'), {
      target: { value: 'test-api-key' }
    });
    fireEvent.change(screen.getByPlaceholderText('+86 13800138000'), {
      target: { value: '+8613800138000' }
    });
    fireEvent.change(screen.getByLabelText('商业名称'), {
      target: { value: 'Test' }
    });
    
    const testButton = screen.getByText('测试连接');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText('测试中...')).toBeInTheDocument();
    });
  });
});

describe('WhatsAppInboxCard', () => {
  const mockOnAction = vi.fn();
  
  const mockConversations = [
    {
      id: 'conv-1',
      customerName: 'John Smith',
      customerPhone: '+1234567890',
      lastMessage: 'Can you send me the price list?',
      lastMessageTime: '2026-03-28T10:30:00Z',
      unreadCount: 2,
      status: 'active',
      leadScore: 85,
    },
    {
      id: 'conv-2',
      customerName: 'Sarah Johnson',
      customerPhone: '+9876543210',
      lastMessage: 'Thanks for the information',
      lastMessageTime: '2026-03-28T09:15:00Z',
      unreadCount: 0,
      status: 'pending',
      leadScore: 72,
    },
  ];

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('renders conversation list', () => {
    render(<WhatsAppInboxCard data={{ conversations: mockConversations }} onAction={mockOnAction} />);
    
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('shows unread message count', () => {
    render(<WhatsAppInboxCard data={{ conversations: mockConversations }} onAction={mockOnAction} />);
    
    // The unread badge should show "2"
    const badges = screen.getAllByText('2');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('displays lead score for conversations', () => {
    render(<WhatsAppInboxCard data={{ conversations: mockConversations }} onAction={mockOnAction} />);
    
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('filters conversations by search term', () => {
    render(<WhatsAppInboxCard data={{ conversations: mockConversations }} onAction={mockOnAction} />);
    
    const searchInput = screen.getByPlaceholderText('搜索对话...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
  });

  it('triggers handover action', () => {
    render(<WhatsAppInboxCard data={{ conversations: mockConversations }} onAction={mockOnAction} />);
    
    const handoverButtons = screen.getAllByText('人工接管');
    fireEvent.click(handoverButtons[0]);
    
    expect(mockOnAction).toHaveBeenCalledWith('whatsapp-handover', expect.objectContaining({
      conversationId: 'conv-1'
    }));
  });

  it('shows empty state when no conversations', () => {
    render(<WhatsAppInboxCard data={{ conversations: [] }} onAction={mockOnAction} />);
    
    expect(screen.getByText('暂无对话')).toBeInTheDocument();
  });

  it('filters by unread conversations', () => {
    render(<WhatsAppInboxCard data={{ conversations: mockConversations }} onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByText('未读'));
    
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
  });
});
