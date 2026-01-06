import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificaService } from '../../core/services';
import { NotificaDTO, NotifichePageResponse, TipoNotificaEnum, AttoreNotificaEnum } from '../../core/models';

@Component({
  selector: 'app-notifiche',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifiche.component.html',
  styleUrl: './notifiche.component.css',
})
export class NotificheComponent implements OnInit {
  private notificaService = inject(NotificaService);

  notifiche = signal<NotificaDTO[]>([]);
  isLoading = signal(false);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  filtroAttore = signal<string | null>(null);
  filtroLetta = signal<boolean | null>(null);

  hasNonLette = computed(() => this.notifiche().some((n) => !n.letta));

  readonly pageSize = 20;

  ngOnInit(): void {
    this.loadNotifiche();
  }

  loadNotifiche(): void {
    this.isLoading.set(true);
    this.notificaService.getNotifiche(this.currentPage(), this.pageSize).subscribe({
      next: (response: NotifichePageResponse) => {
        let filtered = response.content;

        // Applica filtri localmente
        if (this.filtroAttore()) {
          filtered = filtered.filter((n) => n.attore === this.filtroAttore());
        }
        if (this.filtroLetta() !== null) {
          filtered = filtered.filter((n) => n.letta === this.filtroLetta());
        }

        this.notifiche.set(filtered);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  segnaComeLetta(notifica: NotificaDTO): void {
    if (!notifica.letta) {
      this.notificaService.segnaComeLetta(notifica.id).subscribe(() => {
        const updated = this.notifiche().map((n) =>
          n.id === notifica.id ? { ...n, letta: true } : n
        );
        this.notifiche.set(updated);
      });
    }
  }

  segnaTutteComeLette(): void {
    this.notificaService.segnaTutteComeLette().subscribe(() => {
      const updated = this.notifiche().map((n) => ({ ...n, letta: true }));
      this.notifiche.set(updated);
    });
  }

  setFiltroAttore(attore: string | null): void {
    this.filtroAttore.set(attore);
    this.currentPage.set(0);
    this.loadNotifiche();
  }

  setFiltroLetta(letta: boolean | null): void {
    this.filtroLetta.set(letta);
    this.currentPage.set(0);
    this.loadNotifiche();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadNotifiche();
    }
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

  getBadgeClass(attore: string): string {
    return attore === AttoreNotificaEnum.INVITATO ? 'bg-primary' : 'bg-secondary';
  }

  private parseDate(dateString: string | null | undefined): Date {
    if (!dateString) return new Date();

    // Se il timestamp non ha timezone, trattalo come UTC
    const timestamp = dateString.endsWith('Z') || dateString.includes('+')
      ? dateString
      : dateString + 'Z';
    return new Date(timestamp);
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Adesso';

    const date = this.parseDate(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTempoRelativo(dataCreazione: string | null | undefined): string {
    if (!dataCreazione) return 'Adesso';

    const now = new Date();
    const data = this.parseDate(dataCreazione);
    const diffMs = now.getTime() - data.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Adesso';
    if (diffMinutes < 60) return `${diffMinutes} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return this.formatDate(dataCreazione);
  }
}
