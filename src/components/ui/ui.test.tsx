import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi as mock } from 'vitest';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { Ring } from './Ring';

describe('Button', () => {
  it('mặc định type="button" và gọi onClick', async () => {
    const onClick = mock.fn();
    render(<Button onClick={onClick}>Kiểm tra</Button>);
    const button = screen.getByRole('button', { name: 'Kiểm tra' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('bị vô hiệu thì không gọi onClick', async () => {
    const onClick = mock.fn();
    render(
      <Button disabled onClick={onClick}>
        Kiểm tra
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('áp đúng màu theo variant', () => {
    render(<Button variant="success">Tiếp tục</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-success');
  });
});

describe('ProgressBar / Ring', () => {
  it('kẹp giá trị ngoài 0..1 và báo phần trăm cho trình đọc màn hình', () => {
    render(
      <>
        <ProgressBar value={1.5} label="Bài học" />
        <Ring value={-0.2} label="XP">
          0/50
        </Ring>
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Bài học' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByRole('progressbar', { name: 'XP' })).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0/50')).toBeInTheDocument();
  });
});

describe('BottomSheet', () => {
  it('chỉ hiện khi open', () => {
    const { rerender } = render(
      <BottomSheet open={false} label="Kết quả">
        Chuẩn luôn!
      </BottomSheet>,
    );
    expect(screen.queryByText('Chuẩn luôn!')).not.toBeInTheDocument();
    rerender(
      <BottomSheet open label="Kết quả">
        Chuẩn luôn!
      </BottomSheet>,
    );
    expect(screen.getByRole('region', { name: 'Kết quả' })).toHaveTextContent('Chuẩn luôn!');
  });
});
