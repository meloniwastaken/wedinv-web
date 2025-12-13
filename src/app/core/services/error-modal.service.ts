import { Injectable, signal } from '@angular/core';

export interface ErrorModalData {
  title: string;
  message: string;
  messages?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ErrorModalService {
  private readonly visibleSignal = signal(false);
  private readonly dataSignal = signal<ErrorModalData | null>(null);

  readonly visible = this.visibleSignal.asReadonly();
  readonly data = this.dataSignal.asReadonly();

  show(data: ErrorModalData): void {
    this.dataSignal.set(data);
    this.visibleSignal.set(true);
  }

  showError(message: string, title: string = 'Errore'): void {
    this.show({ title, message });
  }

  showErrors(messages: string[], title: string = 'Errore'): void {
    this.show({ title, message: messages[0] || 'Si è verificato un errore', messages });
  }

  hide(): void {
    this.visibleSignal.set(false);
    this.dataSignal.set(null);
  }
}
