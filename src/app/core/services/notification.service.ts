import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Thin wrapper around the snack bar so features share the same look and timing. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3500 });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 7000, politeness: 'assertive' });
  }

  /** Shows a message with an action (e.g. "Desfazer"); resolves `true` if it was clicked. */
  async withAction(message: string, action: string): Promise<boolean> {
    const ref = this.snackBar.open(message, action, { duration: 6000 });
    return new Promise((resolve) => {
      let clicked = false;
      ref.onAction().subscribe(() => (clicked = true));
      ref.afterDismissed().subscribe(() => resolve(clicked));
    });
  }
}
