import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitatoService } from '../../../core/services';
import { InvitatoRiepilogoDTO, ListaInvitatiResponse, StatoInvito, InvioInvitiResponse } from '../../../core/models';

@Component({
  selector: 'app-lista-invitati',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-invitati.component.html',
  styleUrl: './lista-invitati.component.css'
})
export class ListaInvitatiComponent implements OnInit {
  loading = signal(true);
  sending = signal(false);
  data = signal<ListaInvitatiResponse | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  searchTerm = signal('');
  selectedIds = signal<Set<string>>(new Set());
  showSendModal = signal(false);
  sendResult = signal<InvioInvitiResponse | null>(null);

  StatoInvito = StatoInvito;

  filteredInvitati = computed(() => {
    const invitati = this.data()?.invitati || [];
    const term = this.searchTerm().toLowerCase();

    if (!term) return invitati;

    return invitati.filter(inv =>
      inv.nome.toLowerCase().includes(term) ||
      inv.cognome.toLowerCase().includes(term) ||
      inv.email.toLowerCase().includes(term)
    );
  });

  allSelected = computed(() => {
    const filtered = this.filteredInvitati();
    if (filtered.length === 0) return false;
    return filtered.every(inv => this.selectedIds().has(inv.id));
  });

  someSelected = computed(() => {
    return this.selectedIds().size > 0;
  });

  selectedCount = computed(() => this.selectedIds().size);

  nonInviatiCount = computed(() => {
    const invitati = this.data()?.invitati || [];
    return invitati.filter(inv => inv.statoInvito === StatoInvito.DA_INVIARE).length;
  });

  constructor(private invitatoService: InvitatoService) {}

  ngOnInit(): void {
    this.loadInvitati();
  }

  loadInvitati(): void {
    this.loading.set(true);
    this.error.set(null);

    this.invitatoService.getInvitatiRiepilogo().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore nel caricamento degli invitati');
        this.loading.set(false);
      }
    });
  }

  toggleSelection(id: string): void {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      const filtered = this.filteredInvitati();
      this.selectedIds.set(new Set(filtered.map(inv => inv.id)));
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  getStatoBadgeClass(stato: number | null): string {
    switch (stato) {
      case StatoInvito.DA_INVIARE:
        return 'bg-secondary';
      case StatoInvito.INVIATO:
        return 'bg-info';
      case StatoInvito.CONFERMATO:
        return 'bg-success';
      case StatoInvito.RIFIUTATO:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  openSendModal(): void {
    this.showSendModal.set(true);
    this.sendResult.set(null);
  }

  closeSendModal(): void {
    this.showSendModal.set(false);
    this.sendResult.set(null);
  }

  sendToSelected(): void {
    this.sending.set(true);
    this.error.set(null);

    this.invitatoService.inviaInviti({
      invitatoIds: Array.from(this.selectedIds())
    }).subscribe({
      next: (result) => {
        this.sendResult.set(result);
        this.sending.set(false);
        this.selectedIds.set(new Set());
        this.loadInvitati();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'invio');
        this.sending.set(false);
        this.showSendModal.set(false);
      }
    });
  }

  sendToAllNonInviati(): void {
    this.sending.set(true);
    this.error.set(null);

    this.invitatoService.inviaInviti({
      tuttiNonInviati: true
    }).subscribe({
      next: (result) => {
        this.sendResult.set(result);
        this.sending.set(false);
        this.loadInvitati();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'invio');
        this.sending.set(false);
        this.showSendModal.set(false);
      }
    });
  }

  deleteInvitato(id: string, nome: string, cognome: string): void {
    if (!confirm(`Sei sicuro di voler eliminare ${nome} ${cognome}?`)) {
      return;
    }

    this.invitatoService.eliminaInvitato(id).subscribe({
      next: () => {
        this.success.set('Invitato eliminato con successo');
        this.loadInvitati();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'eliminazione');
      }
    });
  }
}
