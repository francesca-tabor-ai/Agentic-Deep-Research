import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResearchResultDisplay from './ResearchResultDisplay';
import type { ResearchResult, Citation } from '@/api';

const mockResult: ResearchResult = {
  id: 1,
  research_query_id: 1,
  summary: 'Brief summary.',
  content: JSON.stringify({
    query: 'What is agentic AI?',
    summary: 'Key findings summary here.',
    sections: [
      { heading: 'Source A', text: 'Content from source A.', sourceIds: ['vault:1'] },
    ],
    confidence: 0.85,
  }),
  created_at: '2025-01-01T00:00:00Z',
};

const mockCitations: Citation[] = [
  {
    id: 1,
    research_result_id: 1,
    title: 'Source A',
    source_url: 'https://example.com/a',
    snippet: 'Snippet text.',
    source_id: 'vault:1',
    created_at: '2025-01-01T00:00:00Z',
  },
];

describe('ResearchResultDisplay', () => {
  it('renders confidence indicator', () => {
    render(<ResearchResultDisplay result={mockResult} citations={mockCitations} />);
    expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('renders key findings section with summary', () => {
    render(<ResearchResultDisplay result={mockResult} citations={mockCitations} />);
    expect(screen.getByText('Key findings')).toBeInTheDocument();
    expect(screen.getByText('Key findings summary here.')).toBeInTheDocument();
  });

  it('renders synthesis sections with headings', () => {
    render(<ResearchResultDisplay result={mockResult} citations={mockCitations} />);
    expect(screen.getByRole('heading', { name: 'Source A', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Content from source A.')).toBeInTheDocument();
  });

  it('renders consensus & disagreement and research gaps sections', () => {
    render(<ResearchResultDisplay result={mockResult} citations={mockCitations} />);
    expect(screen.getAllByText(/consensus.*disagreement/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Research gaps')).toBeInTheDocument();
  });

  it('renders evidence & source transparency with citation link', () => {
    render(<ResearchResultDisplay result={mockResult} citations={mockCitations} />);
    expect(screen.getByText(/evidence.*source transparency/i)).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /source a/i });
    expect(links.some((el) => el.getAttribute('href') === 'https://example.com/a')).toBe(true);
  });

  it('handles unparseable content gracefully', () => {
    const badResult: ResearchResult = {
      ...mockResult,
      content: 'not json',
    };
    render(<ResearchResultDisplay result={badResult} citations={[]} />);
    expect(screen.getByText(/unable to parse report/i)).toBeInTheDocument();
  });
});
