import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResearchQueryForm from './ResearchQueryForm';

describe('ResearchQueryForm', () => {
  it('renders query input and submit button', () => {
    const onSubmit = vi.fn();
    render(<ResearchQueryForm onSubmit={onSubmit} />);
    expect(screen.getByPlaceholderText(/natural language|topic or question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run research/i })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    const onSubmit = vi.fn();
    render(<ResearchQueryForm onSubmit={onSubmit} />);
    expect(screen.getByRole('button', { name: /run research/i })).toBeDisabled();
  });

  it('calls onSubmit with trimmed query text when submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ResearchQueryForm onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText(/natural language|topic or question/i);
    await user.type(input, '  What is agentic AI?  ');
    await user.click(screen.getByRole('button', { name: /run research/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('What is agentic AI?', expect.any(Object));
  });

  it('shows advanced options when toggled', async () => {
    const user = userEvent.setup();
    render(<ResearchQueryForm onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/depth/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /advanced options/i }));
    expect(screen.getByLabelText(/depth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/include vault/i)).toBeInTheDocument();
  });

  it('disables submit when isSubmitting', () => {
    render(<ResearchQueryForm onSubmit={vi.fn()} isSubmitting />);
    const btn = screen.getByRole('button', { name: /submitting|run research/i });
    expect(btn).toBeDisabled();
  });
});
