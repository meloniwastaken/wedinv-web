import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InvitoPubblicoService, ThemeService, ListaNozzeService, TitleService } from '../../../core/services';
import { InvitoPubblicoResponse } from '../../../core/models';
import { NavbarPubblicoComponent } from '../../../shared/components/navbar-pubblico/navbar-pubblico.component';

@Component({
  selector: 'app-matrimonio-pubblico',
  standalone: true,
  imports: [CommonModule, NavbarPubblicoComponent],
  templateUrl: './matrimonio-pubblico.component.html',
  styleUrl: './matrimonio-pubblico.component.css'
})
export class MatrimonioPubblicoComponent implements OnInit {
  loading = signal(true);
  invito = signal<InvitoPubblicoResponse | null>(null);
  error = signal<string | null>(null);
  invitoId: string = '';

  // Flag per navbar
  hasListaNozze = signal(false);

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
        this.themeService.applyThemeForPublicPage(invito.stileCodice);
        this.titleService.setTitleWithSposi(invito.nomeSposoA, invito.nomeSposoB);
        this.checkListaNozze();
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

  get nomeInvitato(): string {
    const inv = this.invito();
    return inv ? `${inv.nomeInvitato} ${inv.cognomeInvitato}` : '';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string | null): string {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
  }

  openMaps(link: string | null): void {
    if (link) {
      window.open(link, '_blank');
    }
  }
}
