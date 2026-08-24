import { Accordion } from '@/components/ui';
import type { FaqEntry } from '@/data/faq';

export function FaqList({
  entries,
  tone = 'paper',
  defaultOpen = [0],
}: {
  entries: readonly FaqEntry[];
  tone?: 'paper' | 'ink';
  defaultOpen?: readonly number[];
}) {
  return (
    <Accordion
      tone={tone}
      defaultOpen={defaultOpen}
      items={entries.map((entry) => ({
        question: entry.question,
        answer: (
          <div className="space-y-3">
            {entry.answer.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        ),
      }))}
    />
  );
}
