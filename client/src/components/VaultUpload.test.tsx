import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VaultUpload from './VaultUpload';

describe('VaultUpload', () => {
  it('renders title input and add button', () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    render(<VaultUpload onUpload={onUpload} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to vault/i })).toBeInTheDocument();
  });

  it('submit is disabled when title is empty', () => {
    render(<VaultUpload onUpload={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add to vault/i })).toBeDisabled();
  });

  it('calls onUpload with title when submitted', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockResolvedValue(undefined);
    render(<VaultUpload onUpload={onUpload} />);
    await user.type(screen.getByLabelText(/title/i), 'My paper');
    await user.click(screen.getByRole('button', { name: /add to vault/i }));
    expect(onUpload).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My paper' })
    );
  });

  it('shows optional fields when expanded', async () => {
    const user = userEvent.setup();
    render(<VaultUpload onUpload={vi.fn()} />);
    expect(screen.queryByLabelText(/content or abstract/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /add content or source url/i }));
    expect(screen.getByLabelText(/content or abstract/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/source url/i)).toBeInTheDocument();
  });
});
