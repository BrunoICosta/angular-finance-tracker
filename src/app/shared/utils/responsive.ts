import { BreakpointObserver } from '@angular/cdk/layout';
import { Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export const HANDSET_QUERY = '(max-width: 719.98px)';

/** Signal that is `true` while the media query matches. Must run in an injection context. */
export function injectMediaQuery(query: string): Signal<boolean> {
  const observer = inject(BreakpointObserver);
  return toSignal(observer.observe(query).pipe(map((state) => state.matches)), {
    initialValue: observer.isMatched(query),
  });
}
