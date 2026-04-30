import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslationParams } from '../../i18n/translated-text';

/** All texts are translation keys; `params` are interpolated into the message. */
export interface ConfirmDialogData {
  readonly title: string;
  readonly message: string;
  readonly params?: TranslationParams;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  /** Styles the confirm button as a destructive action. */
  readonly destructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslocoPipe],
  template: `
    <h2 mat-dialog-title>{{ data.title | transloco: data.params }}</h2>
    <mat-dialog-content>
      <p class="message">{{ data.message | transloco: data.params }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">
        {{ data.cancelLabel ?? 'common.cancel' | transloco }}
      </button>
      <button
        mat-flat-button
        type="button"
        cdkFocusInitial
        [class.destructive]="data.destructive"
        [mat-dialog-close]="true"
      >
        {{ data.confirmLabel ?? 'common.confirm' | transloco }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .message {
      margin: 0;
    }
    .destructive {
      --mat-button-filled-container-color: var(--mat-sys-error);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
