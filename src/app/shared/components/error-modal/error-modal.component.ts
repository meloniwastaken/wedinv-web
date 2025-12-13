import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalService } from '../../../core/services/error-modal.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (errorModalService.visible()) {
      <div class="modal-backdrop" (click)="close()"></div>
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="bi bi-exclamation-triangle-fill text-warning"></i>
            <h3>{{ errorModalService.data()?.title }}</h3>
          </div>
          <div class="modal-body">
            @if (errorModalService.data()?.messages && errorModalService.data()!.messages!.length > 1) {
              <ul class="error-list">
                @for (msg of errorModalService.data()?.messages; track msg) {
                  <li>{{ msg }}</li>
                }
              </ul>
            } @else {
              <p>{{ errorModalService.data()?.message }}</p>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="close()">
              Ho capito
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1040;
      animation: fadeIn 0.2s ease;
    }

    .modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }

    .modal-content {
      background: #ffffff;
      border-radius: 1rem;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #e5e5e5;
    }

    .modal-header i {
      font-size: 1.5rem;
      color: #f0ad4e;
    }

    .modal-header h3 {
      margin: 0;
      font-family: var(--font-display);
      font-size: 1.25rem;
      color: #333333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body p {
      margin: 0;
      color: #333333;
      line-height: 1.6;
    }

    .error-list {
      margin: 0;
      padding-left: 1.25rem;
      color: #333333;
    }

    .error-list li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }

    .error-list li:last-child {
      margin-bottom: 0;
    }

    .modal-footer {
      padding: 1rem 1.5rem 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class ErrorModalComponent {
  readonly errorModalService = inject(ErrorModalService);

  close(): void {
    this.errorModalService.hide();
  }
}
