import { Injectable, Provider, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';

/** Paginator labels from the root translation file, refreshed on every language change. */
@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  private readonly transloco = inject(TranslocoService);
  private rangeTemplate = '{{start}}–{{end}} de {{length}}';

  constructor() {
    super();
    this.transloco
      .selectTranslateObject('paginator')
      .pipe(takeUntilDestroyed())
      .subscribe((labels: Record<string, string>) => {
        this.itemsPerPageLabel = labels['itemsPerPage'];
        this.nextPageLabel = labels['next'];
        this.previousPageLabel = labels['previous'];
        this.firstPageLabel = labels['first'];
        this.lastPageLabel = labels['last'];
        this.rangeTemplate = labels['range'];
        this.changes.next();
      });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const start = length === 0 || pageSize === 0 ? 0 : page * pageSize + 1;
    const end = length === 0 || pageSize === 0 ? 0 : Math.min(page * pageSize + pageSize, length);
    return this.rangeTemplate
      .replace('{{start}}', String(start))
      .replace('{{end}}', String(end))
      .replace('{{length}}', String(length));
  };
}

export function provideTranslatedPaginator(): Provider {
  return { provide: MatPaginatorIntl, useClass: TranslatedPaginatorIntl };
}
