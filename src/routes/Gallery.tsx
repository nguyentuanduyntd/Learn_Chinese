import { useEffect, useState, type ReactNode } from 'react';
import { HanVietBadge } from '@/components/hanzi/HanVietBadge';
import { HanziDisplay } from '@/components/hanzi/HanziDisplay';
import { Pinyin } from '@/components/hanzi/Pinyin';
import { ToneBadge } from '@/components/hanzi/ToneBadge';
import { Bao } from '@/components/mascot/Bao';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Page } from '@/components/ui/Page';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Ring } from '@/components/ui/Ring';
import { vi } from '@/i18n/vi';
import { applyTheme } from '@/services/theme';
import type { Tone } from '@/types/content';
import type { BaoMood } from '@/types/ui';
import type { ThemeSetting } from '@/types/user';

const THEMES: ThemeSetting[] = ['light', 'dark', 'system'];
const MOODS: BaoMood[] = ['happy', 'cheer', 'oops', 'sleepy', 'proud'];
const TONES: Tone[] = [1, 2, 3, 4, 5];
const t = vi.gallery;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <Card className="flex flex-wrap items-center gap-3">{children}</Card>
    </section>
  );
}

/** Trang /dev/gallery — chỉ có ở bản dev (SPEC M1). */
export default function Gallery() {
  const [theme, setTheme] = useState<ThemeSetting>('system');
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => applyTheme(theme), [theme]);

  return (
    <Page title={t.title}>
      <p className="mb-4 text-sm text-muted">{t.devOnly}</p>

      <Section title={t.theme}>
        {THEMES.map((option) => (
          <Button
            key={option}
            variant={theme === option ? 'primary' : 'secondary'}
            aria-pressed={theme === option}
            onClick={() => setTheme(option)}
          >
            {vi.theme[option]}
          </Button>
        ))}
      </Section>

      <Section title={t.buttons}>
        <Button>{t.sampleCheck}</Button>
        <Button variant="success">{t.sampleContinue}</Button>
        <Button variant="secondary">{t.sampleSkip}</Button>
        <Button variant="ghost">{t.sampleSkip}</Button>
        <Button disabled>{t.sampleDisabled}</Button>
      </Section>

      <Section title={t.cardsChips}>
        <p className="w-full">{t.sampleCard}</p>
        <Chip>{t.sampleChips[0]}</Chip>
        <Chip variant="primary">{t.sampleChips[1]}</Chip>
        <Chip variant="accent">{t.sampleChips[2]}</Chip>
        <Chip variant="success">{t.sampleChips[3]}</Chip>
      </Section>

      <Section title={t.progress}>
        <ProgressBar value={0.6} label={t.sampleProgress} />
        <Ring value={0.7} label={t.sampleRing}>
          35/50
        </Ring>
      </Section>

      <Section title={t.pinyin}>
        <Pinyin text="Nǐ hǎo! Mā má mǎ mà ma." className="text-2xl font-semibold" />
        {TONES.map((tone) => (
          <ToneBadge key={tone} tone={tone} />
        ))}
      </Section>

      <Section title={t.hanzi}>
        <HanziDisplay text="好" onSpeak={() => undefined} />
        <div className="flex flex-col gap-2">
          <Pinyin text="hǎo" className="text-2xl font-semibold" />
          <HanVietBadge reading="hảo" />
          <HanziDisplay text="你好" size="md" />
        </div>
      </Section>

      <Section title={t.bao}>
        {MOODS.map((mood) => (
          <Bao key={mood} mood={mood} size={72} />
        ))}
      </Section>

      <Section title={t.sheet}>
        <Button variant="secondary" onClick={() => setSheetOpen((open) => !open)}>
          {sheetOpen ? t.sheetClose : t.sheetOpen}
        </Button>
      </Section>

      <BottomSheet open={sheetOpen} label={t.sheetLabel}>
        <div className="flex items-center gap-3">
          <Bao mood="cheer" size={56} />
          <p className="text-lg font-extrabold text-success">
            {t.sheetVerdict}{' '}
            <span className="font-han text-text" lang="zh-CN">
              好
            </span>{' '}
            <Pinyin text="hǎo" /> = {t.sheetMeaning}
          </p>
        </div>
        <Button variant="success" block className="mt-4" onClick={() => setSheetOpen(false)}>
          {t.sampleContinue}
        </Button>
      </BottomSheet>
    </Page>
  );
}
