import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitoPubblicoService, ThemeService } from '../../../core/services';
import { InvitoPubblicoResponse, StatoInvito } from '../../../core/models';

@Component({
  selector: 'app-invito-pubblico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invito-pubblico.component.html',
  styleUrl: './invito-pubblico.component.css'
})
export class InvitoPubblicoComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  invito = signal<InvitoPubblicoResponse | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  invitoId: string = '';

  showConfirmForm = signal(false);
  plusConfermati = signal(0);
  intolleranzeAlimentari = signal('');

  StatoInvito = StatoInvito;

  isConfermato = computed(() =>
    this.invito()?.statoInvito === StatoInvito.CONFERMATO
  );

  isRifiutato = computed(() =>
    this.invito()?.statoInvito === StatoInvito.RIFIUTATO
  );

  hasResponded = computed(() =>
    this.isConfermato() || this.isRifiutato()
  );

  constructor(
    private invitoPubblicoService: InvitoPubblicoService,
    private themeService: ThemeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.invitoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.invitoId) {
      this.loadInvito();
    } else {
      this.error.set('Invito non trovato');
      this.loading.set(false);
    }
  }

  private loadInvito(): void {
    this.invitoPubblicoService.getInvito(this.invitoId).subscribe({
      next: (invito) => {
        this.invito.set(invito);
        this.plusConfermati.set(invito.plusConfermati || 0);
        this.intolleranzeAlimentari.set(invito.intolleranzeAlimentari || '');
        // Applica il tema del matrimonio (se presente, altrimenti default)
        this.themeService.applyThemeForPublicPage(invito.stileCodice);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Invito non trovato o non valido');
        } else {
          this.error.set('Errore nel caricamento dell\'invito');
        }
        this.loading.set(false);
      }
    });
  }

  openConfirmForm(): void {
    this.showConfirmForm.set(true);
  }

  cancelConfirm(): void {
    this.showConfirmForm.set(false);
    this.plusConfermati.set(this.invito()?.plusConfermati || 0);
    this.intolleranzeAlimentari.set(this.invito()?.intolleranzeAlimentari || '');
  }

  confermaPartecipazione(): void {
    this.saving.set(true);
    this.error.set(null);

    this.invitoPubblicoService.confermaInvito(this.invitoId, {
      confermato: true,
      plusConfermati: this.plusConfermati(),
      intolleranzeAlimentari: this.intolleranzeAlimentari() || null
    }).subscribe({
      next: () => {
        this.success.set('La tua conferma è stata registrata!');
        this.saving.set(false);
        this.showConfirmForm.set(false);
        this.loadInvito();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante la conferma');
        this.saving.set(false);
      }
    });
  }

  rifiutaPartecipazione(): void {
    if (!confirm('Sei sicuro di voler rifiutare l\'invito?')) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.invitoPubblicoService.confermaInvito(this.invitoId, {
      confermato: false,
      plusConfermati: 0,
      intolleranzeAlimentari: this.intolleranzeAlimentari() || null
    }).subscribe({
      next: () => {
        this.success.set('La tua risposta è stata registrata.');
        this.saving.set(false);
        this.showConfirmForm.set(false);
        this.loadInvito();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'operazione');
        this.saving.set(false);
      }
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string | null): string {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  }

  openMaps(link: string | null): void {
    if (link) {
      window.open(link, '_blank');
    }
  }
}
