import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InvitoPubblicoService, ThemeService, ListaNozzeService } from '../../../core/services';
import { InvitoPubblicoResponse } from '../../../core/models';
import { NavbarPubblicoComponent } from '../../../shared/components/navbar-pubblico/navbar-pubblico.component';

@Component({
  selector: 'app-iban-pubblico',
  standalone: true,
  imports: [CommonModule, NavbarPubblicoComponent],
  templateUrl: './iban-pubblico.component.html',
  styleUrl: './iban-pubblico.component.css'
})
export class IbanPubblicoComponent implements OnInit {
  loading = signal(true);
  invito = signal<InvitoPubblicoResponse | null>(null);
  error = signal<string | null>(null);
  invitoId: string = '';
  ibanCopied = signal(false);

  // Flag per navbar
  hasListaNozze = signal(false);

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

    this.invitoPubblicoService.getInvito(this.invitoId).subscribe({
      next: (invito) => {
        this.invito.set(invito);
        this.themeService.applyThemeForPublicPage(invito.stileCodice);
        // Verifica se ci sono elementi nella lista nozze
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

  get hasIban(): boolean {
    return !!this.invito()?.iban;
  }

  copyIban(): void {
    const iban = this.invito()?.iban;
    if (iban) {
      navigator.clipboard.writeText(iban).then(() => {
        this.ibanCopied.set(true);
        setTimeout(() => this.ibanCopied.set(false), 2000);
      });
    }
  }
}
