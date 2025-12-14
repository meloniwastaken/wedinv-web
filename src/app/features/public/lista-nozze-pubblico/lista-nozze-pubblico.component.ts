import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InvitoPubblicoService, ThemeService } from '../../../core/services';
import { InvitoPubblicoResponse } from '../../../core/models';
import { NavbarPubblicoComponent } from '../../../shared/components/navbar-pubblico/navbar-pubblico.component';

@Component({
  selector: 'app-lista-nozze-pubblico',
  standalone: true,
  imports: [CommonModule, NavbarPubblicoComponent],
  templateUrl: './lista-nozze-pubblico.component.html',
  styleUrl: './lista-nozze-pubblico.component.css'
})
export class ListaNozzePubblicoComponent implements OnInit {
  loading = signal(true);
  invito = signal<InvitoPubblicoResponse | null>(null);
  error = signal<string | null>(null);
  invitoId: string = '';
  ibanCopied = signal(false);

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
        this.themeService.applyThemeForPublicPage(invito.stileCodice);
        this.loading.set(false);
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

  get nomeInvitato(): string {
    const inv = this.invito();
    return inv ? `${inv.nomeInvitato} ${inv.cognomeInvitato}` : '';
  }

  get hasListaNozze(): boolean {
    const inv = this.invito();
    return !!(inv?.linkListaNozze || inv?.iban);
  }

  openListaNozze(): void {
    const link = this.invito()?.linkListaNozze;
    if (link) {
      window.open(link, '_blank');
    }
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
