import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitoPubblicoService, ThemeService, ListaNozzeService, TitleService } from '../../../core/services';
import {
  InvitoPubblicoResponse,
  StatoInvito,
  AccompagnatoreDTO,
  MembroFamigliaPubblico,
  ConfermaMembroFamiglia
} from '../../../core/models';
import { NavbarPubblicoComponent } from '../../../shared/components/navbar-pubblico/navbar-pubblico.component';
import { SafePipe } from '../../../shared/pipes/safe.pipe';

interface AccompagnatoreForm {
  nome: string;
  cognome: string;
}

interface ConfermaMembroForm {
  id: string;
  nome: string;
  cognome: string;
  confermato: boolean;
  capogruppo: boolean;
  intolleranzeAlimentari: string;
  numeroPlusConsentiti: number;
  plusConfermati: number;
  accompagnatori: AccompagnatoreForm[];
  messaggio: string;
}

@Component({
  selector: 'app-invito-pubblico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarPubblicoComponent, SafePipe],
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
  messaggio = signal('');

  // Conferme famiglia (include anche intolleranze per ogni membro)
  confermeFamiglia = signal<ConfermaMembroForm[]>([]);

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

  // Gruppo familiare - tutti i membri hanno accesso uguale
  isCapogruppo = computed(() => this.invito()?.capogruppo === true);
  hasFamiglia = computed(() => (this.invito()?.membriFamiglia?.length ?? 0) > 0);

  // Per famiglia: ha risposto se tutti i membri hanno risposto
  famigliaHasResponded = computed(() => {
    const membri = this.invito()?.membriFamiglia;
    if (!membri || membri.length === 0) return false;
    return membri.every(m =>
      m.statoInvito === StatoInvito.CONFERMATO || m.statoInvito === StatoInvito.RIFIUTATO
    );
  });

  // Verifica se la deadline è passata
  isDeadlinePassata = computed(() => {
    const deadline = this.invito()?.dataDeadlineConferma;
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    return deadlineDate < oggi;
  });

  get nomeInvitato(): string {
    const inv = this.invito();
    if (!inv) return '';
    return `${inv.nomeInvitato} ${inv.cognomeInvitato}`;
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
        this.messaggio.set(invito.messaggio || '');
        // Popola accompagnatori esistenti
        if (invito.accompagnatori && invito.accompagnatori.length > 0) {
          this.accompagnatori.set(invito.accompagnatori.map(a => ({
            nome: a.nome,
            cognome: a.cognome
          })));
        } else {
          this.syncAccompagnatori(invito.plusConfermati || 0);
        }
        // Inizializza conferme famiglia se capogruppo (include intolleranze e accompagnatori)
        if (invito.capogruppo && invito.membriFamiglia && invito.membriFamiglia.length > 0) {
          this.confermeFamiglia.set(invito.membriFamiglia.map(m => ({
            id: m.id,
            nome: m.nome,
            cognome: m.cognome,
            confermato: m.statoInvito === StatoInvito.CONFERMATO,
            capogruppo: m.capogruppo === true,
            intolleranzeAlimentari: m.intolleranzeAlimentari || '',
            numeroPlusConsentiti: m.numeroPlusConsentiti || 0,
            plusConfermati: m.plusConfermati || 0,
            accompagnatori: (m.accompagnatori || []).map(a => ({ nome: a.nome, cognome: a.cognome })),
            messaggio: m.messaggio || ''
          })));
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
    this.messaggio.set(this.invito()?.messaggio || '');
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

  toggleConfermaFamiglia(id: string): void {
    const current = [...this.confermeFamiglia()];
    const index = current.findIndex(m => m.id === id);
    if (index >= 0) {
      current[index] = { ...current[index], confermato: !current[index].confermato };
      this.confermeFamiglia.set(current);
    }
  }

  setAllFamigliaConfermato(value: boolean): void {
    const current = this.confermeFamiglia().map(m => ({ ...m, confermato: value }));
    this.confermeFamiglia.set(current);
  }

  confermaPartecipazione(): void {
    this.saving.set(true);
    this.error.set(null);

    // Prepara accompagnatori (solo quelli con nome e cognome compilati)
    const accompagnatori = this.accompagnatori()
      .filter(a => a.nome.trim() && a.cognome.trim())
      .map(a => ({ nome: a.nome.trim(), cognome: a.cognome.trim() }));

    // Prepara conferme famiglia se capogruppo (include intolleranze, plus, accompagnatori e messaggio per ogni membro)
    const confermeFamiglia = this.isCapogruppo()
      ? this.confermeFamiglia().map(m => ({
          id: m.id,
          confermato: m.confermato,
          intolleranzeAlimentari: m.intolleranzeAlimentari || null,
          plusConfermati: m.plusConfermati,
          accompagnatori: m.accompagnatori
            .filter(a => a.nome.trim() && a.cognome.trim())
            .map(a => ({ nome: a.nome.trim(), cognome: a.cognome.trim() })),
          messaggio: m.messaggio || null
        }))
      : undefined;

    this.invitoPubblicoService.confermaInvito(this.invitoId, {
      confermato: true,
      plusConfermati: this.plusConfermati(),
      intolleranzeAlimentari: this.intolleranzeAlimentari() || null,
      accompagnatori: accompagnatori.length > 0 ? accompagnatori : undefined,
      messaggio: this.messaggio() || null,
      confermeFamiglia
    }).subscribe({
      next: () => {
        this.success.set(this.isCapogruppo() ? 'Le conferme sono state registrate!' : 'La tua conferma è stata registrata!');
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
      intolleranzeAlimentari: this.intolleranzeAlimentari() || null,
      messaggio: this.messaggio() || null
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

  // Helper per mostrare intolleranze famiglia
  hasAnyFamilyIntollerances(): boolean {
    const membri = this.invito()?.membriFamiglia;
    if (!membri || membri.length === 0) return false;
    return membri.some(m => m.intolleranzeAlimentari && m.intolleranzeAlimentari.trim() !== '');
  }

  getMembriWithIntollerances() {
    const membri = this.invito()?.membriFamiglia;
    if (!membri) return [];
    return membri.filter(m => m.intolleranzeAlimentari && m.intolleranzeAlimentari.trim() !== '');
  }

  // Aggiorna intolleranze di un membro nel form conferma famiglia
  updateIntolleranzeFamiglia(id: string, value: string): void {
    const current = [...this.confermeFamiglia()];
    const index = current.findIndex(m => m.id === id);
    if (index >= 0) {
      current[index] = { ...current[index], intolleranzeAlimentari: value };
      this.confermeFamiglia.set(current);
    }
  }

  // Aggiorna messaggio di un membro nel form conferma famiglia
  updateMessaggioFamiglia(id: string, value: string): void {
    const current = [...this.confermeFamiglia()];
    const index = current.findIndex(m => m.id === id);
    if (index >= 0) {
      current[index] = { ...current[index], messaggio: value };
      this.confermeFamiglia.set(current);
    }
  }

  // Aggiorna il numero di plus confermati per un membro
  onPlusMembroChange(membroId: string, value: number): void {
    const current = [...this.confermeFamiglia()];
    const index = current.findIndex(m => m.id === membroId);
    if (index >= 0) {
      const membro = { ...current[index] };
      membro.plusConfermati = value;
      // Sync accompagnatori array
      if (value > membro.accompagnatori.length) {
        const newAccompagnatori = [...membro.accompagnatori];
        for (let i = membro.accompagnatori.length; i < value; i++) {
          newAccompagnatori.push({ nome: '', cognome: '' });
        }
        membro.accompagnatori = newAccompagnatori;
      } else {
        membro.accompagnatori = membro.accompagnatori.slice(0, value);
      }
      current[index] = membro;
      this.confermeFamiglia.set(current);
    }
  }

  // Aggiorna un accompagnatore di un membro
  updateAccompagnatoreMembro(membroId: string, accIndex: number, field: 'nome' | 'cognome', value: string): void {
    const current = [...this.confermeFamiglia()];
    const index = current.findIndex(m => m.id === membroId);
    if (index >= 0) {
      const membro = { ...current[index] };
      const accompagnatori = [...membro.accompagnatori];
      accompagnatori[accIndex] = { ...accompagnatori[accIndex], [field]: value };
      membro.accompagnatori = accompagnatori;
      current[index] = membro;
      this.confermeFamiglia.set(current);
    }
  }
}
