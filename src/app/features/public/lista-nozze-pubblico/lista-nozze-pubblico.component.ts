import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InvitoPubblicoService, ThemeService, ListaNozzeService } from '../../../core/services';
import { InvitoPubblicoResponse, ListaNozzePubblicoResponse, ElementoListaNozzePubblicoDTO } from '../../../core/models';
import { NavbarPubblicoComponent } from '../../../shared/components/navbar-pubblico/navbar-pubblico.component';

@Component({
  selector: 'app-lista-nozze-pubblico',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarPubblicoComponent],
  templateUrl: './lista-nozze-pubblico.component.html',
  styleUrl: './lista-nozze-pubblico.component.css'
})
export class ListaNozzePubblicoComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  invito = signal<InvitoPubblicoResponse | null>(null);
  listaNozze = signal<ListaNozzePubblicoResponse | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  invitoId: string = '';
  ibanCopied = signal(false);

  // Set di ID elementi selezionati (prenotati da me o che voglio prenotare)
  selectedIds = signal<Set<string>>(new Set());

  // Traccia se ci sono modifiche non salvate
  hasChanges = computed(() => {
    const lista = this.listaNozze();
    if (!lista) return false;

    const currentSelected = this.selectedIds();
    const originalSelected = new Set(
      lista.elementi
        .filter(e => e.prenotatoDaMe)
        .map(e => e.id)
    );

    if (currentSelected.size !== originalSelected.size) return true;
    for (const id of currentSelected) {
      if (!originalSelected.has(id)) return true;
    }
    return false;
  });

  constructor(
    private invitoPubblicoService: InvitoPubblicoService,
    private listaNozzeService: ListaNozzeService,
    private themeService: ThemeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.invitoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.invitoId) {
      this.loadData();
    } else {
      this.error.set('Invito non trovato');
      this.loading.set(false);
    }
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Carica invito per info generali e tema
    this.invitoPubblicoService.getInvito(this.invitoId).subscribe({
      next: (invito) => {
        this.invito.set(invito);
        this.themeService.applyThemeForPublicPage(invito.stileCodice);
        // Carica lista nozze
        this.loadListaNozze();
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Invito non trovato o non valido');
        } else {
          this.error.set('Errore nel caricamento dei dati');
        }
        this.loading.set(false);
      }
    });
  }

  private loadListaNozze(): void {
    this.listaNozzeService.getListaNozzePubblica(this.invitoId).subscribe({
      next: (lista) => {
        this.listaNozze.set(lista);
        // Inizializza selezioni con elementi già prenotati da me
        const prenotatiDaMe = new Set(
          lista.elementi
            .filter(e => e.prenotatoDaMe)
            .map(e => e.id)
        );
        this.selectedIds.set(prenotatiDaMe);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Errore nel caricamento della lista nozze');
        this.loading.set(false);
      }
    });
  }

  get nomeInvitato(): string {
    const inv = this.invito();
    return inv ? `${inv.nomeInvitato} ${inv.cognomeInvitato}` : '';
  }

  get hasListaNozze(): boolean {
    const lista = this.listaNozze();
    const inv = this.invito();
    return !!(lista?.elementi?.length || inv?.linkListaNozze || inv?.iban);
  }

  get hasElementi(): boolean {
    const lista = this.listaNozze();
    return !!(lista?.elementi?.length);
  }

  toggleSelection(elemento: ElementoListaNozzePubblicoDTO): void {
    // Non permettere selezione se prenotato da altri
    if (elemento.prenotatoDaAltri) return;

    const current = new Set(this.selectedIds());
    if (current.has(elemento.id)) {
      current.delete(elemento.id);
    } else {
      current.add(elemento.id);
    }
    this.selectedIds.set(current);
  }

  isSelected(elemento: ElementoListaNozzePubblicoDTO): boolean {
    return this.selectedIds().has(elemento.id);
  }

  salvaPrenotazioni(): void {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const request = {
      elementiPrenotati: Array.from(this.selectedIds())
    };

    this.listaNozzeService.aggiornaPrenotazioni(this.invitoId, request).subscribe({
      next: () => {
        this.success.set('Le tue prenotazioni sono state salvate!');
        this.saving.set(false);
        // Ricarica la lista per aggiornare gli stati
        this.loadListaNozze();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante il salvataggio');
        this.saving.set(false);
      }
    });
  }

  openLink(link: string | null): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  openListaNozzeEsterna(): void {
    const link = this.listaNozze()?.linkListaNozze || this.invito()?.linkListaNozze;
    if (link) {
      window.open(link, '_blank');
    }
  }

  copyIban(): void {
    const iban = this.listaNozze()?.iban || this.invito()?.iban;
    if (iban) {
      navigator.clipboard.writeText(iban).then(() => {
        this.ibanCopied.set(true);
        setTimeout(() => this.ibanCopied.set(false), 2000);
      });
    }
  }

  getElementoClass(elemento: ElementoListaNozzePubblicoDTO): string {
    if (elemento.prenotatoDaAltri) {
      return 'elemento-prenotato-altri';
    }
    if (this.isSelected(elemento)) {
      return 'elemento-selezionato';
    }
    return '';
  }
}
