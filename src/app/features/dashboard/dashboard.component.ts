import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatrimonioService, InvitatoService, AuthService, ThemeService } from '../../core/services';
import { MatrimonioDTO, ListaInvitatiResponse, StatoInvito } from '../../core/models';
import { FlipCountdownComponent } from '../../shared/components/flip-countdown/flip-countdown.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FlipCountdownComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  matrimonio = signal<MatrimonioDTO | null>(null);
  invitatiData = signal<ListaInvitatiResponse | null>(null);
  error = signal<string | null>(null);

  userName = computed(() => {
    const user = this.authService.user();
    return user ? `${user.nome} ${user.cognome}` : '';
  });

  hasMatrimonio = computed(() => !!this.matrimonio());

  giorniMancanti = computed(() => {
    const mat = this.matrimonio();
    if (!mat?.dataCerimonia) return null;

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const dataCerimonia = new Date(mat.dataCerimonia);
    dataCerimonia.setHours(0, 0, 0, 0);

    const diffTime = dataCerimonia.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  });

  totalePersone = computed(() => {
    const data = this.invitatiData();
    if (!data) return 0;

    let totale = 0;
    data.invitati.forEach(inv => {
      if (inv.statoInvito === StatoInvito.CONFERMATO) {
        totale += 1 + (inv.plusConfermati || 0);
      }
    });
    return totale;
  });

  constructor(
    private matrimonioService: MatrimonioService,
    private invitatoService: InvitatoService,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.matrimonioService.getMatrimonio().subscribe({
      next: (matrimonio) => {
        this.matrimonio.set(matrimonio);
        // Inizializza il tema dal matrimonio (se esiste)
        this.themeService.initializeTheme(matrimonio?.stileCodice || null);
        if (matrimonio) {
          this.loadInvitati();
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Errore nel caricamento dei dati');
        this.loading.set(false);
      }
    });
  }

  private loadInvitati(): void {
    this.invitatoService.getInvitatiRiepilogo().subscribe({
      next: (data) => {
        this.invitatiData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
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
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  }
}
