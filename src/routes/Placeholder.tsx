import { Bao } from '@/components/mascot/Bao';
import { Card } from '@/components/ui/Card';
import { Page } from '@/components/ui/Page';
import { vi } from '@/i18n/vi';
import type { BaoMood } from '@/types/ui';

type PageKey = keyof typeof vi.pages;

const MOOD: Record<PageKey, BaoMood> = {
  learn: 'happy',
  review: 'cheer',
  notebook: 'proud',
  profile: 'sleepy',
};

/** Route rỗng cho M1 — nội dung thật làm ở M6/M8. */
export function Placeholder({ page }: { page: PageKey }) {
  const copy = vi.pages[page];
  return (
    <Page title={copy.title}>
      <Card className="flex items-center gap-4">
        <Bao mood={MOOD[page]} size={72} />
        <p className="text-muted">{copy.placeholder}</p>
      </Card>
    </Page>
  );
}
