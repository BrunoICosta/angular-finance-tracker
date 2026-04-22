import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/** Browser file helpers: download generated text and read files picked by the person. */
@Injectable({ providedIn: 'root' })
export class FileTransferService {
  private readonly document = inject(DOCUMENT);

  download(content: string, fileName: string, mimeType: string): void {
    // The BOM makes Excel open UTF-8 accents correctly.
    const blob = new Blob(['\uFEFF', content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    this.document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  readText(file: File): Promise<string> {
    return file.text();
  }
}
