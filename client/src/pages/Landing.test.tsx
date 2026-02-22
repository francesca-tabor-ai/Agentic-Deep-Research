import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Landing from './Landing';

describe('Landing', () => {
  it('renders hero heading and CTA', () => {
    render(<Landing />);
    expect(screen.getByText(/from question to synthesis/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to research/i })).toHaveAttribute('href', '/research');
  });

  it('renders research capabilities section', () => {
    render(<Landing />);
    expect(screen.getByText('Research capabilities')).toBeInTheDocument();
    expect(screen.getByText(/natural language queries/i)).toBeInTheDocument();
    expect(screen.getByText(/citation-grounded/i)).toBeInTheDocument();
  });

  it('renders nav links to Research and Vault', () => {
    render(<Landing />);
    const researchLinks = screen.getAllByRole('link', { name: /research/i });
    expect(researchLinks.length).toBeGreaterThan(0);
    const vaultLink = screen.getByRole('link', { name: /vault/i });
    expect(vaultLink).toHaveAttribute('href', '/vault');
  });
});
