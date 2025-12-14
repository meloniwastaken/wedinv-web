import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListaNozzeService } from '../../core/services';
import { ElementoListaNozzeDTO, CreaElementoListaNozzeRequest } from '../../core/models';

@Component({
  selector: 'app-lista-nozze',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-nozze.component.html',
  styleUrl: './lista-nozze.component.css'
})
export class ListaNozzeComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  hasMatrimonio = signal(true);
  elementi = signal<ElementoListaNozzeDTO[]>([]);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Modal per nuovo/modifica elemento
  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingElemento = signal<ElementoListaNozzeDTO | null>(null);

  // Form fields
  formNome = signal('');
  formDescrizione = signal('');
  formLink = signal('');

  constructor(private listaNozzeService: ListaNozzeService) {}

  ngOnInit(): void {
    this.loadElementi();
  }

  loadElementi(): void {
    this.loading.set(true);
    this.error.set(null);

    this.listaNozzeService.getElementi().subscribe({
      next: (data) => {
        this.hasMatrimonio.set(data.hasMatrimonio);
        this.elementi.set(data.elementi || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore nel caricamento della lista nozze');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingElemento.set(null);
    this.formNome.set('');
    this.formDescrizione.set('');
    this.formLink.set('');
    this.showModal.set(true);
  }

  openEditModal(elemento: ElementoListaNozzeDTO): void {
    this.modalMode.set('edit');
    this.editingElemento.set(elemento);
    this.formNome.set(elemento.nome);
    this.formDescrizione.set(elemento.descrizione || '');
    this.formLink.set(elemento.link || '');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingElemento.set(null);
  }

  saveElemento(): void {
    if (!this.formNome().trim()) {
      this.error.set('Il nome è obbligatorio');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const request: CreaElementoListaNozzeRequest = {
      nome: this.formNome().trim(),
      descrizione: this.formDescrizione().trim() || null,
      link: this.formLink().trim() || null
    };

    if (this.modalMode() === 'create') {
      this.listaNozzeService.creaElemento(request).subscribe({
        next: () => {
          this.success.set('Elemento aggiunto con successo');
          this.saving.set(false);
          this.closeModal();
          this.loadElementi();
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Errore durante il salvataggio');
          this.saving.set(false);
        }
      });
    } else {
      const elementoId = this.editingElemento()?.id;
      if (elementoId) {
        this.listaNozzeService.aggiornaElemento(elementoId, request).subscribe({
          next: () => {
            this.success.set('Elemento aggiornato con successo');
            this.saving.set(false);
            this.closeModal();
            this.loadElementi();
            setTimeout(() => this.success.set(null), 3000);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Errore durante l\'aggiornamento');
            this.saving.set(false);
          }
        });
      }
    }
  }

  deleteElemento(elemento: ElementoListaNozzeDTO): void {
    if (!confirm(`Sei sicuro di voler eliminare "${elemento.nome}"?`)) {
      return;
    }

    this.listaNozzeService.eliminaElemento(elemento.id).subscribe({
      next: () => {
        this.success.set('Elemento eliminato con successo');
        this.loadElementi();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'eliminazione');
      }
    });
  }

  openLink(link: string | null): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  getPrenotazioneText(elemento: ElementoListaNozzeDTO): string {
    if (!elemento.invitatoPrenotante) {
      return 'Disponibile';
    }
    return `Prenotato da ${elemento.nomePrenotante || 'Invitato'}`;
  }

  getPrenotazioneBadgeClass(elemento: ElementoListaNozzeDTO): string {
    return elemento.invitatoPrenotante ? 'bg-success' : 'bg-secondary';
  }
}
