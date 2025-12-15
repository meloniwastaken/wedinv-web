import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitoPubblicoService, ThemeService, ListaNozzeService, TitleService } from '../../../core/services';
import { InvitoPubblicoResponse, StatoInvito, AccompagnatoreDTO } from '../../../core/models';
import { NavbarPubblicoComponent } from '../../../shared/components/navbar-pubblico/navbar-pubblico.component';

interface AccompagnatoreForm {
  nome: string;
  cognome: string;
}

@Component({
  selector: 'app-invito-pubblico',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarPubblicoComponent],
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
  accompagnatori = signal<AccompagnatoreForm[]>([]);

  StatoInvito = StatoInvito;

  // Flag per navbar
  hasListaNozze = signal(false);

  isConfermato = computed(() =>
    this.invito()?.statoInvito === StatoInvito.CONFERMATO
  );

  isRifiutato = computed(() =>
    this.invito()?.statoInvito === StatoInvito.RIFIUTATO
  );

  hasResponded = computed(() =>
    this.isConfermato() || this.isRifiutato()
  );

  get nomeInvitato(): string {
    const inv = this.invito();
    return inv ? `${inv.nomeInvitato} ${inv.cognomeInvitato}` : '';
  }

  get hasIban(): boolean {
    return !!this.invito()?.iban;
  }

  constructor(
    private invitoPubblicoService: InvitoPubblicoService,
    private listaNozzeService: ListaNozzeService,
    private themeService: ThemeService,
    private titleService: TitleService,
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
        // Popola accompagnatori esistenti
        if (invito.accompagnatori && invito.accompagnatori.length > 0) {
          this.accompagnatori.set(invito.accompagnatori.map(a => ({
            nome: a.nome,
            cognome: a.cognome
          })));
        } else {
          this.syncAccompagnatori(invito.plusConfermati || 0);
        }
        // Applica il tema del matrimonio (se presente, altrimenti default)
        this.themeService.applyThemeForPublicPage(invito.stileCodice);
        // Imposta il titolo della pagina con i nomi degli sposi
        this.titleService.setTitleWithSposi(invito.nomeSposoA, invito.nomeSposoB);
        // Verifica se ci sono elementi nella lista nozze
        this.checkListaNozze();
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

  private checkListaNozze(): void {
    this.listaNozzeService.getListaNozzePubblica(this.invitoId).subscribe({
      next: (lista) => {
        this.hasListaNozze.set(lista.elementi && lista.elementi.length > 0);
        this.loading.set(false);
      },
      error: () => {
        this.hasListaNozze.set(false);
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
    // Ripristina accompagnatori dal server
    const invito = this.invito();
    if (invito?.accompagnatori && invito.accompagnatori.length > 0) {
      this.accompagnatori.set(invito.accompagnatori.map(a => ({
        nome: a.nome,
        cognome: a.cognome
      })));
    } else {
      this.syncAccompagnatori(invito?.plusConfermati || 0);
    }
  }

  onPlusConfermatiChange(value: number): void {
    this.plusConfermati.set(value);
    this.syncAccompagnatori(value);
  }

  private syncAccompagnatori(count: number): void {
    const current = this.accompagnatori();
    if (count > current.length) {
      // Aggiungi nuovi accompagnatori vuoti
      const newAccompagnatori = [...current];
      for (let i = current.length; i < count; i++) {
        newAccompagnatori.push({ nome: '', cognome: '' });
      }
      this.accompagnatori.set(newAccompagnatori);
    } else if (count < current.length) {
      // Rimuovi accompagnatori in eccesso
      this.accompagnatori.set(current.slice(0, count));
    }
  }

  updateAccompagnatore(index: number, field: 'nome' | 'cognome', value: string): void {
    const current = [...this.accompagnatori()];
    current[index] = { ...current[index], [field]: value };
    this.accompagnatori.set(current);
  }

  confermaPartecipazione(): void {
    this.saving.set(true);
    this.error.set(null);

    // Prepara accompagnatori (solo quelli con nome e cognome compilati)
    const accompagnatori = this.accompagnatori()
      .filter(a => a.nome.trim() && a.cognome.trim())
      .map(a => ({ nome: a.nome.trim(), cognome: a.cognome.trim() }));

    this.invitoPubblicoService.confermaInvito(this.invitoId, {
      confermato: true,
      plusConfermati: this.plusConfermati(),
      intolleranzeAlimentari: this.intolleranzeAlimentari() || null,
      accompagnatori: accompagnatori.length > 0 ? accompagnatori : undefined
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
