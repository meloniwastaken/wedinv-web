import { Component, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitatoService, AuthService } from '../../../core/services';
import { GruppoFamiliareService } from '../../../core/services/gruppo-familiare.service';
import { InvitatoRiepilogoDTO, ListaInvitatiResponse, StatoInvito, InvioInvitiResponse, CanaleInvio, ImportaInvitatiResponse } from '../../../core/models';

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
  modalStep = signal<1 | 2 | 3 | 'whatsapp'>(1); // 1=select channel, 2=select recipients, 3=result, 'whatsapp'=whatsapp view
  selectedCanale = signal<CanaleInvio | null>(null);
  validationErrors = signal<string[]>([]);
  whatsappSearchTerm = signal('');
  whatsappSentIds = signal<Set<string>>(new Set());
  confirmingIds = signal<Set<string>>(new Set());
  importing = signal(false);
  showImportModal = signal(false);
  importResult = signal<ImportaInvitatiResponse | null>(null);
  importModalStep = signal<1 | 2>(1); // 1 = file selection, 2 = result
  selectedFile = signal<File | null>(null);
  isDragging = signal(false);
  showDeleteModal = signal(false);
  deleteTarget = signal<{ id: string; nome: string; cognome: string } | null>(null);
  deleting = signal(false);
  showDeleteAllModal = signal(false);
  deletingAll = signal(false);

  // Gruppo Familiare
  showGruppoModal = signal(false);
  selectedMembriIds = signal<Set<string>>(new Set());
  membriSearchTerm = signal('');
  nomeGruppo = signal('');
  creatingGruppo = signal(false);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  StatoInvito = StatoInvito;
  CanaleInvio = CanaleInvio;

  filteredInvitati = computed(() => {
    const invitati = this.data()?.invitati || [];
    const term = this.searchTerm().toLowerCase();

    let filtered = invitati;
    if (term) {
      filtered = invitati.filter(inv =>
        inv.nome.toLowerCase().includes(term) ||
        inv.cognome.toLowerCase().includes(term) ||
        (inv.email?.toLowerCase().includes(term) ?? false)
      );
    }

    // Ordinamento alfabetico per nome e cognome
    return [...filtered].sort((a, b) => {
      const nomeCompare = a.nome.localeCompare(b.nome, 'it');
      if (nomeCompare !== 0) return nomeCompare;
      return a.cognome.localeCompare(b.cognome, 'it');
    });
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

  hasMatrimonio = computed(() => this.data()?.hasMatrimonio ?? true);

  isPremium = computed(() => this.authService.isActive());

  invitatiCount = computed(() => this.data()?.invitati?.length || 0);

  canCreateInvitato = computed(() => {
    if (this.isPremium()) return true;
    return this.invitatiCount() < 3;
  });

  // Invitati filtrati per la vista WhatsApp (solo quelli con telefono)
  whatsappInvitati = computed(() => {
    const invitati = this.data()?.invitati || [];
    const term = this.whatsappSearchTerm().toLowerCase();

    let filtered = invitati.filter(inv => inv.telefono);

    if (term) {
      filtered = filtered.filter(inv =>
        inv.nome.toLowerCase().includes(term) ||
        inv.cognome.toLowerCase().includes(term) ||
        (inv.telefono?.includes(term) ?? false)
      );
    }

    // Ordinamento alfabetico per nome e cognome
    return [...filtered].sort((a, b) => {
      const nomeCompare = a.nome.localeCompare(b.nome, 'it');
      if (nomeCompare !== 0) return nomeCompare;
      return a.cognome.localeCompare(b.cognome, 'it');
    });
  });

  // Può creare gruppo familiare se ci sono almeno 2 invitati disponibili (senza gruppo)
  canCreateGruppoFamiliare = computed(() => {
    const invitati = this.data()?.invitati || [];
    const disponibili = invitati.filter(inv => !inv.gruppoFamiliare);
    return disponibili.length >= 2;
  });

  // Invitati disponibili per essere membri di un gruppo familiare (senza gruppo)
  filteredMembriList = computed(() => {
    const invitati = this.data()?.invitati || [];
    const term = this.membriSearchTerm().toLowerCase();

    let filtered = invitati.filter(inv => !inv.gruppoFamiliare);

    if (term) {
      filtered = filtered.filter(inv =>
        inv.nome.toLowerCase().includes(term) ||
        inv.cognome.toLowerCase().includes(term) ||
        (inv.email?.toLowerCase().includes(term) ?? false)
      );
    }

    return [...filtered].sort((a, b) => {
      const nomeCompare = a.nome.localeCompare(b.nome, 'it');
      if (nomeCompare !== 0) return nomeCompare;
      return a.cognome.localeCompare(b.cognome, 'it');
    });
  });

  // Numero membri selezionati
  selectedMembriCount = computed(() => this.selectedMembriIds().size);

  constructor(
    private invitatoService: InvitatoService,
    private authService: AuthService,
    private gruppoFamiliareService: GruppoFamiliareService
  ) {}

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
    const invitati = this.data()?.invitati || [];
    const invitato = invitati.find(inv => inv.id === id);

    if (current.has(id)) {
      current.delete(id);
      // Se fa parte di un gruppo familiare, deseleziona anche gli altri membri
      if (invitato?.gruppoFamiliare) {
        const familyMembers = invitati.filter(inv => inv.gruppoFamiliare === invitato.gruppoFamiliare);
        familyMembers.forEach(member => current.delete(member.id));
      }
    } else {
      current.add(id);
      // Se fa parte di un gruppo familiare, seleziona automaticamente tutti i membri
      if (invitato?.gruppoFamiliare) {
        const familyMembers = invitati.filter(inv => inv.gruppoFamiliare === invitato.gruppoFamiliare);
        familyMembers.forEach(member => current.add(member.id));
      }
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
        return 'bg-dark';
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
    this.modalStep.set(1);
    this.selectedCanale.set(null);
    this.validationErrors.set([]);
  }

  closeSendModal(): void {
    this.showSendModal.set(false);
    this.sendResult.set(null);
    this.modalStep.set(1);
    this.selectedCanale.set(null);
    this.validationErrors.set([]);
  }

  selectCanale(canale: CanaleInvio): void {
    this.selectedCanale.set(canale);
    this.modalStep.set(2);
    this.validationErrors.set([]);
  }

  backToChannelSelection(): void {
    this.modalStep.set(1);
    this.validationErrors.set([]);
  }

  sendToSelected(): void {
    const canale = this.selectedCanale();
    if (!canale) return;

    this.sending.set(true);
    this.error.set(null);
    this.validationErrors.set([]);

    this.invitatoService.inviaInviti({
      invitatoIds: Array.from(this.selectedIds()),
      canale
    }).subscribe({
      next: (result) => {
        this.sendResult.set(result);
        this.modalStep.set(3);
        this.sending.set(false);
        this.selectedIds.set(new Set());
        this.loadInvitati();
      },
      error: (err) => {
        this.sending.set(false);
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors.set(err.error.errors);
        } else {
          this.error.set(err.error?.message || 'Errore durante l\'invio');
          this.showSendModal.set(false);
        }
      }
    });
  }

  sendToAllNonInviati(): void {
    const canale = this.selectedCanale();
    if (!canale) return;

    this.sending.set(true);
    this.error.set(null);
    this.validationErrors.set([]);

    this.invitatoService.inviaInviti({
      tuttiNonInviati: true,
      canale
    }).subscribe({
      next: (result) => {
        this.sendResult.set(result);
        this.modalStep.set(3);
        this.sending.set(false);
        this.loadInvitati();
      },
      error: (err) => {
        this.sending.set(false);
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors.set(err.error.errors);
        } else {
          this.error.set(err.error?.message || 'Errore durante l\'invio');
          this.showSendModal.set(false);
        }
      }
    });
  }

  deleteInvitato(id: string, nome: string, cognome: string): void {
    this.deleteTarget.set({ id, nome, cognome });
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleting.set(true);

    this.invitatoService.eliminaInvitato(target.id).subscribe({
      next: () => {
        this.success.set('Invitato eliminato con successo');
        this.closeDeleteModal();
        this.loadInvitati();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.deleting.set(false);
        this.error.set(err.error?.message || 'Errore durante l\'eliminazione');
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deleteTarget.set(null);
    this.deleting.set(false);
  }

  openDeleteAllModal(): void {
    this.showDeleteAllModal.set(true);
  }

  closeDeleteAllModal(): void {
    this.showDeleteAllModal.set(false);
    this.deletingAll.set(false);
  }

  confirmDeleteAll(): void {
    this.deletingAll.set(true);

    this.invitatoService.eliminaTuttiInvitati().subscribe({
      next: () => {
        this.success.set('Tutti gli invitati sono stati eliminati');
        this.closeDeleteAllModal();
        this.loadInvitati();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.deletingAll.set(false);
        this.error.set(err.error?.message || 'Errore durante l\'eliminazione');
        this.closeDeleteAllModal();
      }
    });
  }

  openWhatsappView(): void {
    this.modalStep.set('whatsapp');
    this.whatsappSearchTerm.set('');
    this.whatsappSentIds.set(new Set());
    this.confirmingIds.set(new Set());
  }

  getWhatsappLink(invitato: InvitatoRiepilogoDTO): string {
    if (!invitato.telefono) return '';

    // Normalizza il numero (rimuovi spazi, trattini, parentesi)
    let phone = invitato.telefono.replace(/[\s\-\(\)]/g, '');

    // Se inizia con 0, sostituisci con +39 (Italia)
    if (phone.startsWith('0')) {
      phone = '+39' + phone.substring(1);
    }
    // Se non ha prefisso internazionale, aggiungi +39
    if (!phone.startsWith('+')) {
      phone = '+39' + phone;
    }

    // Costruisci il link all'invito
    const invitationUrl = `${window.location.origin}/invito/${invitato.id}`;

    // Messaggio precompilato con link
    let message: string;

    if (invitato.gruppoFamiliare && invitato.numMembriGruppo && invitato.numMembriGruppo > 1) {
      // Messaggio per membro di un gruppo familiare
      message = `Ciao ${invitato.nome}!\n\nSiete invitati al nostro matrimonio!\n\nQuesto invito è per tutta la tua famiglia (${invitato.numMembriGruppo} persone).\n\nClicca qui per confermare la presenza di tutti e vedere i dettagli dell'evento:\n${invitationUrl}`;
    } else {
      // Messaggio per invitato singolo
      message = `Ciao ${invitato.nome}!\n\nSei invitato al nostro matrimonio!\n\nClicca qui per confermare la tua presenza e vedere tutti i dettagli dell'evento:\n${invitationUrl}`;
    }

    // Rimuove tutti i caratteri non numerici (inclusi caratteri invisibili Unicode)
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  markWhatsappSent(id: string): void {
    const current = new Set(this.whatsappSentIds());
    current.add(id);
    this.whatsappSentIds.set(current);
  }

  confermaInvioWhatsapp(id: string): void {
    // Aggiungi all'elenco dei "in conferma"
    const confirming = new Set(this.confirmingIds());
    confirming.add(id);
    this.confirmingIds.set(confirming);

    this.invitatoService.confermaInvioWhatsapp(id).subscribe({
      next: () => {
        // Rimuovi da confirming
        const updated = new Set(this.confirmingIds());
        updated.delete(id);
        this.confirmingIds.set(updated);

        // Ricarica i dati per aggiornare lo stato
        this.loadInvitati();
      },
      error: (err) => {
        // Rimuovi da confirming
        const updated = new Set(this.confirmingIds());
        updated.delete(id);
        this.confirmingIds.set(updated);

        this.error.set(err.error?.message || 'Errore durante la conferma dell\'invio');
      }
    });
  }

  openImportModal(): void {
    this.showImportModal.set(true);
    this.importModalStep.set(1);
    this.selectedFile.set(null);
    this.importResult.set(null);
    this.isDragging.set(false);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile.set(file);

    // Reset input per permettere di selezionare lo stesso file
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Verifica che sia un file Excel
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.selectedFile.set(file);
      } else {
        this.error.set('Seleziona un file Excel (.xlsx o .xls)');
      }
    }
  }

  removeSelectedFile(): void {
    this.selectedFile.set(null);
  }

  proceedWithImport(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.importing.set(true);
    this.error.set(null);
    this.importResult.set(null);
    this.importModalStep.set(2);

    this.invitatoService.importaInvitati(file).subscribe({
      next: (result) => {
        this.importResult.set(result);
        this.importing.set(false);
        this.loadInvitati();
      },
      error: (err) => {
        this.importing.set(false);
        this.importResult.set({
          totaleImportati: 0,
          totaleFalliti: 0,
          errori: [err.error?.message || 'Errore durante l\'importazione']
        });
      }
    });
  }

  downloadTemplate(): void {
    this.invitatoService.downloadTemplateImportazione();
  }

  closeImportModal(): void {
    this.showImportModal.set(false);
    this.importResult.set(null);
    this.selectedFile.set(null);
    this.importModalStep.set(1);
  }

  // Gruppo Familiare methods
  openGruppoModal(): void {
    this.showGruppoModal.set(true);
    this.selectedMembriIds.set(new Set());
    this.membriSearchTerm.set('');
    this.nomeGruppo.set('');
  }

  closeGruppoModal(): void {
    this.showGruppoModal.set(false);
    this.selectedMembriIds.set(new Set());
    this.membriSearchTerm.set('');
    this.nomeGruppo.set('');
    this.creatingGruppo.set(false);
  }

  toggleMembro(id: string): void {
    const current = new Set(this.selectedMembriIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedMembriIds.set(current);
  }

  isMemberSelected(id: string): boolean {
    return this.selectedMembriIds().has(id);
  }

  confirmCreaGruppo(): void {
    const membriIds = Array.from(this.selectedMembriIds());
    if (membriIds.length < 2) return;

    this.creatingGruppo.set(true);
    this.error.set(null);

    const nomeGruppoVal = this.nomeGruppo().trim();
    this.gruppoFamiliareService.creaGruppoFamiliare({
      membriIds,
      nomeGruppo: nomeGruppoVal || null
    }).subscribe({
      next: () => {
        this.success.set('Gruppo familiare creato con successo');
        this.closeGruppoModal();
        this.loadInvitati();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.creatingGruppo.set(false);
        this.error.set(err.error?.message || 'Errore durante la creazione del gruppo');
      }
    });
  }

  hasGruppoFamiliare(invitato: InvitatoRiepilogoDTO): boolean {
    return !!invitato.gruppoFamiliare;
  }

  getGruppoInfo(invitato: InvitatoRiepilogoDTO): string {
    if (!invitato.gruppoFamiliare) return '';
    if (invitato.nomeGruppo) {
      return `${invitato.nomeGruppo} (${invitato.numMembriGruppo} persone)`;
    }
    return `Gruppo familiare (${invitato.numMembriGruppo} persone)`;
  }

  canSendDirectInvite(invitato: InvitatoRiepilogoDTO): boolean {
    // Tutti possono ricevere invito diretto (anche membri di gruppi familiari)
    return true;
  }
}
