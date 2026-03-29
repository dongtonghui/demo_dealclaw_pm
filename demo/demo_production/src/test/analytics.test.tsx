import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionFunnelCard } from '@/components/dealclaw/cards/ConversionFunnelCard';

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

describe('ConversionFunnelCard', () => {
  const mockOnAction = vi.fn();
  
  const mockFunnelData = {
    stages: [
      { name: '曝光', count: 10000, conversionRate: 100 },
      { name: '访问', count: 2500, conversionRate: 25 },
      { name: '线索', count: 500, conversionRate: 20 },
      { name: '商机', count: 100, conversionRate: 20 },
      { name: '成交', count: 25, conversionRate: 25 },
    ],
    period: '2026-03-01 至 2026-03-31',
    totalRevenue: 125000,
    averageDealSize: 5000,
  };

  it('renders funnel stages', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    expect(screen.getByText('曝光')).toBeInTheDocument();
    expect(screen.getByText('访问')).toBeInTheDocument();
    expect(screen.getByText('线索')).toBeInTheDocument();
    expect(screen.getByText('商机')).toBeInTheDocument();
    expect(screen.getByText('成交')).toBeInTheDocument();
  });

  it('displays conversion rates', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    // Check for conversion rate badges
    expect(screen.getByText('转化率 100%')).toBeInTheDocument();
    expect(screen.getByText('转化率 25%')).toBeInTheDocument();
    expect(screen.getByText('转化率 20%')).toBeInTheDocument();
  });

  it('shows stage counts', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    expect(screen.getByText('1万')).toBeInTheDocument(); // 10000 formatted
    expect(screen.getByText('2,500')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('shows total metrics', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    expect(screen.getByText('¥125,000')).toBeInTheDocument();
    expect(screen.getByText('¥5,000')).toBeInTheDocument();
  });

  it('displays overall conversion rate', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    // Overall conversion: 25/10000 = 0.25%
    expect(screen.getByText('0.25%')).toBeInTheDocument();
  });

  it('shows drop-off information between stages', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    // Check for drop-off indicators
    expect(screen.getByText(/流失 7,500/)).toBeInTheDocument();
    expect(screen.getByText(/流失 2,000/)).toBeInTheDocument();
  });

  it('displays period information', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    expect(screen.getByText('2026-03-01 至 2026-03-31')).toBeInTheDocument();
  });

  it('triggers export action', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByText('导出'));
    
    expect(mockOnAction).toHaveBeenCalledWith('export-funnel');
  });

  it('renders insights section', () => {
    render(<ConversionFunnelCard data={mockFunnelData} onAction={mockOnAction} />);
    
    expect(screen.getByText('转化洞察')).toBeInTheDocument();
    expect(screen.getByText(/从曝光到访问的转化率为/)).toBeInTheDocument();
  });

  it('handles empty stages gracefully', () => {
    const emptyData = {
      stages: [],
      period: '2026-03-01 至 2026-03-31',
      totalRevenue: 0,
      averageDealSize: 0,
    };
    
    render(<ConversionFunnelCard data={emptyData} onAction={mockOnAction} />);
    
    expect(screen.getByText('¥0')).toBeInTheDocument();
    expect(screen.getByText('0.00%')).toBeInTheDocument();
  });
});
