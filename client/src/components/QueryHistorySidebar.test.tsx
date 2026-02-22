import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QueryHistorySidebar from './QueryHistorySidebar';
import type { ResearchQuery } from '@/api';

const mockQueries: ResearchQuery[] = [
  {
    id: 1,
    query_text: 'What is agentic AI?',
    status: 'completed',
    created_at: '2025-02-22T12:00:00Z',
    updated_at: '2025-02-22T12:05:00Z',
  },
  {
    id: 2,
    query_text: 'Recent advances in CRISPR delivery',
    status: 'pending',
    created_at: '2025-02-22T11:00:00Z',
    updated_at: '2025-02-22T11:00:00Z',
  },
];

describe('QueryHistorySidebar', () => {
  it('renders heading and empty state when no queries', () => {
    render(<QueryHistorySidebar queries={[]} />);
    expect(screen.getByText('Query history')).toBeInTheDocument();
    expect(screen.getByText(/no queries yet/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<QueryHistorySidebar queries={[]} isLoading />);
    const loading = document.querySelector('.animate-spin');
    expect(loading).toBeInTheDocument();
  });

  it('renders list of queries with text and status', () => {
    render(<QueryHistorySidebar queries={mockQueries} />);
    expect(screen.getByText('What is agentic AI?')).toBeInTheDocument();
    expect(screen.getByText('Recent advances in CRISPR delivery')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('highlights selected query and links to query param', () => {
    render(<QueryHistorySidebar queries={mockQueries} selectedId={1} />);
    const link = screen.getByText('What is agentic AI?').closest('a');
    expect(link).toHaveAttribute('href', '/research?q=1');
    expect(link?.closest('div')).toHaveClass('bg-primary/10');
  });
});
