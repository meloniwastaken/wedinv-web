import { Component, OnInit, OnDestroy, computed, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificaService, MatrimonioService } from '../../../core/services';
import { NotificaDTO, TipoNotificaEnum } from '../../../core/models';

@Component({
  selector: 'app-notifica-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifica-bell.component.html',
  styleUrl: './notifica-bell.component.css',
})
export class NotificaBellComponent implements OnInit, OnDestroy {
  private notificaService = inject(NotificaService);
  private matrimonioService = inject(MatrimonioService);

  isDropdownOpen = signal(false);

  notifiche = this.notificaService.notifiche;
  countNonLette = this.notificaService.countNonLette;
  hasNonLette = this.notificaService.hasNonLette;

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.notificaService.disconnectWebSocket();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.isDropdownOpen.set(false);
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen.update((v) => !v);

    if (this.isDropdownOpen()) {
      this.notificaService.getUltimeNotifiche().subscribe();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  private loadData(): void {
    this.notificaService.getCountNonLette().subscribe();
    this.notificaService.getUltimeNotifiche().subscribe();

    // Connetti WebSocket quando si ha il matrimonioId
    this.matrimonioService.getMatrimonio().subscribe((matrimonio) => {
      if (matrimonio?.id) {
        this.notificaService.connectWebSocket(matrimonio.id);
      }
    });
  }

  segnaComeLetta(notifica: NotificaDTO, event: Event): void {
    event.stopPropagation();
    if (!notifica.letta) {
      this.notificaService.segnaComeLetta(notifica.id).subscribe();
    }
  }

  segnaTutteComeLette(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.notificaService.segnaTutteComeLette().subscribe();
  }

  getIconForTipo(tipoNotifica: number): string {
    switch (tipoNotifica) {
      case TipoNotificaEnum.CONFERMA_INVITATO:
        return 'bi-check-circle-fill text-success';
      case TipoNotificaEnum.RIFIUTO_INVITATO:
        return 'bi-x-circle-fill text-danger';
      case TipoNotificaEnum.MODIFICA_INTOLLERANZE:
        return 'bi-exclamation-triangle-fill text-warning';
      case TipoNotificaEnum.MODIFICA_PLUS:
        return 'bi-people-fill text-info';
      case TipoNotificaEnum.INVIO_INVITI:
        return 'bi-send-fill text-primary';
      case TipoNotificaEnum.CAMBIO_STATO_INVITO:
        return 'bi-arrow-repeat text-secondary';
      default:
        return 'bi-bell-fill';
    }
  }

  getTempoRelativo(dataCreazione: string): string {
    const now = new Date();
    const data = new Date(dataCreazione);
    const diffMs = now.getTime() - data.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Adesso';
    if (diffMinutes < 60) return `${diffMinutes} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return data.toLocaleDateString('it-IT');
  }
}
