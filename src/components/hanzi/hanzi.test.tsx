import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi as mock } from 'vitest';
import { HanVietBadge } from './HanVietBadge';
import { HanziDisplay } from './HanziDisplay';
import { ToneBadge } from './ToneBadge';

describe('HanziDisplay', () => {
  it('không có onSpeak: chỉ là chữ, gắn lang zh-CN', () => {
    render(<HanziDisplay text="好" />);
    expect(screen.getByText('好')).toHaveAttribute('lang', 'zh-CN');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('có onSpeak: thành nút "Nghe phát âm"', async () => {
    const onSpeak = mock.fn();
    render(<HanziDisplay text="好" onSpeak={onSpeak} />);
    await userEvent.click(screen.getByRole('button', { name: 'Nghe phát âm 好' }));
    expect(onSpeak).toHaveBeenCalledOnce();
  });
});

describe('ToneBadge', () => {
  it('đọc tên thanh và tô viền màu thanh', () => {
    render(
      <>
        <ToneBadge tone={3} />
        <ToneBadge tone={5} />
      </>,
    );
    expect(screen.getByRole('img', { name: 'Thanh 3' })).toHaveClass('border-tone3');
    expect(screen.getByRole('img', { name: 'Thanh nhẹ' })).toHaveClass('border-tone5');
  });
});

describe('HanVietBadge', () => {
  it('có nhãn đầy đủ cho trình đọc màn hình', () => {
    render(<HanVietBadge reading="hảo" />);
    expect(screen.getByText('Âm Hán-Việt: hảo')).toHaveClass('sr-only');
  });
});
