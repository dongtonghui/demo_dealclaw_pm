import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeadAssignmentCard } from '@/components/dealclaw/cards/LeadAssignmentCard';
import { LeadTagsCard } from '@/components/dealclaw/cards/LeadTagsCard';

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

describe('LeadAssignmentCard', () => {
  const mockLead = {
    id: 'L001',
    company: 'Summit Camping Supply',
    score: 92,
    industry: '户外用品',
    location: '美国德州',
  };
  
  const mockTeamMembers = [
    { id: 'user-1', name: '张三', email: 'zhangsan@company.com', role: '销售经理', currentLeads: 15 },
    { id: 'user-2', name: '李四', email: 'lisi@company.com', role: '销售专员', currentLeads: 8 },
    { id: 'user-3', name: '王五', email: 'wangwu@company.com', role: '销售专员', currentLeads: 12 },
  ];

  const mockOnAction = vi.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('renders team member list', () => {
    render(<LeadAssignmentCard data={{ lead: mockLead, teamMembers: mockTeamMembers }} onAction={mockOnAction} />);
    
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
    expect(screen.getByText('王五')).toBeInTheDocument();
  });

  it('shows current lead count for each member', () => {
    render(<LeadAssignmentCard data={{ lead: mockLead, teamMembers: mockTeamMembers }} onAction={mockOnAction} />);
    
    expect(screen.getByText('15 个线索')).toBeInTheDocument();
    expect(screen.getByText('8 个线索')).toBeInTheDocument();
    expect(screen.getByText('12 个线索')).toBeInTheDocument();
  });

  it('displays lead information', () => {
    render(<LeadAssignmentCard data={{ lead: mockLead, teamMembers: mockTeamMembers }} onAction={mockOnAction} />);
    
    expect(screen.getByText('Summit Camping Supply')).toBeInTheDocument();
    expect(screen.getByText('评分: 92')).toBeInTheDocument();
  });

  it('selects team member on click', () => {
    render(<LeadAssignmentCard data={{ lead: mockLead, teamMembers: mockTeamMembers }} onAction={mockOnAction} />);
    
    const memberOption = screen.getByText('李四').closest('div[class*="border"]');
    if (memberOption) {
      fireEvent.click(memberOption);
    }
    
    expect(screen.getByText(/将把 Summit Camping Supply 分配给/)).toBeInTheDocument();
    expect(screen.getByText(/李四/)).toBeInTheDocument();
  });

  it('assigns lead to selected member', async () => {
    render(<LeadAssignmentCard data={{ lead: mockLead, teamMembers: mockTeamMembers }} onAction={mockOnAction} />);
    
    // Select a member
    const memberOption = screen.getByText('李四').closest('div[class*="border"]');
    if (memberOption) {
      fireEvent.click(memberOption);
    }
    
    // Click confirm button
    const confirmButton = screen.getByText('确认分配');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('assign-lead', {
        leadId: 'L001',
        assignTo: 'user-2',
      });
    }, { timeout: 1500 });
  });

  it('disables confirm button when no member selected', () => {
    render(<LeadAssignmentCard data={{ lead: mockLead, teamMembers: mockTeamMembers }} onAction={mockOnAction} />);
    
    const confirmButton = screen.getByText('确认分配');
    expect(confirmButton).toBeDisabled();
  });

  it('triggers cancel action', () => {
    render(<LeadAssignmentCard data={{ lead: mockLead, teamMembers: mockTeamMembers }} onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByText('取消'));
    
    expect(mockOnAction).toHaveBeenCalledWith('cancel-assignment');
  });
});

describe('LeadTagsCard', () => {
  const mockLead = {
    id: 'L001',
    company: 'Summit Camping Supply',
    tags: ['高意向', '美国'],
  };
  
  const availableTags = [
    { id: 'tag-1', name: '高意向', color: 'bg-red-100 text-red-800' },
    { id: 'tag-2', name: '已联系', color: 'bg-blue-100 text-blue-800' },
    { id: 'tag-3', name: '美国', color: 'bg-green-100 text-green-800' },
    { id: 'tag-4', name: '欧洲', color: 'bg-purple-100 text-purple-800' },
  ];

  const mockOnAction = vi.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('renders current tags', () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    expect(screen.getByText('高意向')).toBeInTheDocument();
    expect(screen.getByText('美国')).toBeInTheDocument();
  });

  it('shows available tags not currently selected', () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    expect(screen.getByText('已联系')).toBeInTheDocument();
    expect(screen.getByText('欧洲')).toBeInTheDocument();
  });

  it('adds tag when clicking available tag', () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByText('已联系'));
    
    // Should now be in current tags
    const currentTagsSection = screen.getByText('当前标签').parentElement;
    expect(currentTagsSection?.textContent).toContain('已联系');
  });

  it('removes tag when clicking remove button', () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    // Find and click remove button on '高意向' tag
    const removeButtons = screen.getAllByLabelText('移除标签');
    fireEvent.click(removeButtons[0]);
    
    // Should no longer be in current tags
    const currentTagsSection = screen.getByText('当前标签').parentElement;
    expect(currentTagsSection?.textContent).not.toContain('高意向');
  });

  it('adds custom tag', () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    const input = screen.getByPlaceholderText('输入新标签');
    fireEvent.change(input, { target: { value: '紧急' } });
    fireEvent.click(screen.getByRole('button', { name: '' })); // Plus button
    
    // Should now be in current tags
    const currentTagsSection = screen.getByText('当前标签').parentElement;
    expect(currentTagsSection?.textContent).toContain('紧急');
  });

  it('does not add duplicate custom tag', () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    const input = screen.getByPlaceholderText('输入新标签');
    fireEvent.change(input, { target: { value: '高意向' } }); // Already exists
    fireEvent.click(screen.getByRole('button', { name: '' }));
    
    // Should still only show one '高意向'
    const tags = screen.getAllByText('高意向');
    expect(tags.length).toBe(1);
  });

  it('saves tags on confirm', async () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    // Add a new tag
    fireEvent.click(screen.getByText('已联系'));
    
    // Save
    fireEvent.click(screen.getByText('保存标签'));
    
    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('save-tags', {
        leadId: 'L001',
        tags: ['高意向', '美国', '已联系'],
      });
    }, { timeout: 1000 });
  });

  it('triggers cancel action', () => {
    render(<LeadTagsCard data={{ lead: mockLead, availableTags }} onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByText('取消'));
    
    expect(mockOnAction).toHaveBeenCalledWith('cancel-tags');
  });
});
