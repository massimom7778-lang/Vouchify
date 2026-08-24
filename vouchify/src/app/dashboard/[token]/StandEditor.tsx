'use client';

import { useActionState } from 'react';
import { updateStandTarget, type UpdateResult } from './actions';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * One stand, one form. Deliberately not a modal and not an autosave: an owner
 * pasting a review link wants to see the field, press a button, and be told it
 * saved.
 */
export function StandEditor({
  token,
  code,
  targetUrl,
}: {
  token: string;
  code: string;
  targetUrl: string;
}) {
  const [result, action, pending] = useActionState<UpdateResult | null, FormData>(
    updateStandTarget,
    null,
  );

  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="code" value={code} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Review link for stand {code}</span>
          <input
            name="targetUrl"
            type="url"
            inputMode="url"
            defaultValue={targetUrl}
            placeholder="https://g.page/r/..."
            className="h-11 w-full rounded-sm border border-warm-300 bg-paper px-3 text-sm placeholder:text-warm-500"
          />
        </label>
        <Button type="submit" size="md" variant="solid" disabled={pending} className="shrink-0">
          {pending ? 'Saving…' : 'Save link'}
        </Button>
      </div>
      {result ? (
        <p
          role="status"
          className={cn(
            'mt-2 text-xs font-semibold',
            result.ok ? 'text-gold-deep' : 'text-ink',
          )}
        >
          {result.message}
        </p>
      ) : null}
    </form>
  );
}
