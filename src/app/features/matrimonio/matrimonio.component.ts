import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatrimonioService, ThemeService, AuthService } from '../../core/services';
import { MatrimonioDTO, CreaMatrimonioRequest, AggiornaMatrimonioRequest } from '../../core/models';

@Component({
  selector: 'app-matrimonio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './matrimonio.component.html',
  styleUrl: './matrimonio.component.css'
})
export class MatrimonioComponent implements OnInit {
  matrimonioForm: FormGroup;
  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  isEdit = signal(false);
  editMode = signal(false);
  showDeleteConfirm = signal(false);
  matrimonio = signal<MatrimonioDTO | null>(null);

  isPremium = computed(() => this.authService.isActive());

  constructor(
    private fb: FormBuilder,
    private matrimonioService: MatrimonioService,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.matrimonioForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadMatrimonio();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nomeSposoA: ['', [Validators.required, Validators.minLength(2)]],
      cognomeSposoA: ['', [Validators.required, Validators.minLength(2)]],
      nomeSposoB: ['', [Validators.required, Validators.minLength(2)]],
      cognomeSposoB: ['', [Validators.required, Validators.minLength(2)]],
      dataCerimonia: ['', Validators.required],
      oraCerimonia: [''],
      luogoCerimonia: [''],
      indirizzoCerimonia: [''],
      cittaCerimonia: [''],
      linkMapsCerimonia: [''],
      dataRicevimento: ['', Validators.required],
      oraRicevimento: [''],
      luogoRicevimento: [''],
      indirizzoRicevimento: [''],
      cittaRicevimento: [''],
      linkMapsRicevimento: [''],
      dataDeadlineConferma: [''],
      contattoRiferimento: [''],
      iban: [''],
      note: [''],
      messaggioInvito: [''],
      messaggioIban: ['']
    });
  }

  private loadMatrimonio(): void {
    this.matrimonioService.getMatrimonio().subscribe({
      next: (matrimonio) => {
        if (matrimonio) {
          this.isEdit.set(true);
          this.editMode.set(false); // Start in view mode for existing matrimonio
          this.matrimonio.set(matrimonio);
          this.patchForm(matrimonio);
        } else {
          this.isEdit.set(false);
          this.editMode.set(true); // New matrimonio starts in edit mode
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Errore nel caricamento dei dati');
        this.loading.set(false);
      }
    });
  }

  private patchForm(matrimonio: MatrimonioDTO): void {
    this.matrimonioForm.patchValue({
      nomeSposoA: matrimonio.nomeSposoA,
      cognomeSposoA: matrimonio.cognomeSposoA,
      nomeSposoB: matrimonio.nomeSposoB,
      cognomeSposoB: matrimonio.cognomeSposoB,
      dataCerimonia: matrimonio.dataCerimonia,
      oraCerimonia: matrimonio.oraCerimonia || '',
      luogoCerimonia: matrimonio.luogoCerimonia || '',
      indirizzoCerimonia: matrimonio.indirizzoCerimonia || '',
      cittaCerimonia: matrimonio.cittaCerimonia || '',
      linkMapsCerimonia: matrimonio.linkMapsCerimonia || '',
      dataRicevimento: matrimonio.dataRicevimento,
      oraRicevimento: matrimonio.oraRicevimento || '',
      luogoRicevimento: matrimonio.luogoRicevimento || '',
      indirizzoRicevimento: matrimonio.indirizzoRicevimento || '',
      cittaRicevimento: matrimonio.cittaRicevimento || '',
      linkMapsRicevimento: matrimonio.linkMapsRicevimento || '',
      dataDeadlineConferma: matrimonio.dataDeadlineConferma || '',
      contattoRiferimento: matrimonio.contattoRiferimento || '',
      iban: matrimonio.iban || '',
      note: matrimonio.note || '',
      messaggioInvito: matrimonio.messaggioInvito || '',
      messaggioIban: matrimonio.messaggioIban || ''
    });
  }

  onSubmit(): void {
    if (this.matrimonioForm.invalid) {
      this.matrimonioForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.matrimonioForm.value;
    const request = this.prepareRequest(formValue);

    if (this.isEdit()) {
      this.updateMatrimonio(request);
    } else {
      this.createMatrimonio(request);
    }
  }

  private prepareRequest(formValue: any): CreaMatrimonioRequest {
    return {
      nomeSposoA: formValue.nomeSposoA,
      cognomeSposoA: formValue.cognomeSposoA,
      nomeSposoB: formValue.nomeSposoB,
      cognomeSposoB: formValue.cognomeSposoB,
      dataCerimonia: formValue.dataCerimonia,
      oraCerimonia: formValue.oraCerimonia || null,
      luogoCerimonia: formValue.luogoCerimonia || null,
      indirizzoCerimonia: formValue.indirizzoCerimonia || null,
      cittaCerimonia: formValue.cittaCerimonia || null,
      linkMapsCerimonia: formValue.linkMapsCerimonia || null,
      dataRicevimento: formValue.dataRicevimento,
      oraRicevimento: formValue.oraRicevimento || null,
      luogoRicevimento: formValue.luogoRicevimento || null,
      indirizzoRicevimento: formValue.indirizzoRicevimento || null,
      cittaRicevimento: formValue.cittaRicevimento || null,
      linkMapsRicevimento: formValue.linkMapsRicevimento || null,
      dataDeadlineConferma: formValue.dataDeadlineConferma || null,
      contattoRiferimento: formValue.contattoRiferimento || null,
      iban: formValue.iban || null,
      note: formValue.note || null,
      messaggioInvito: formValue.messaggioInvito || null,
      messaggioIban: formValue.messaggioIban || null,
      stileCodice: this.themeService.currentTheme().id
    };
  }

  private createMatrimonio(request: CreaMatrimonioRequest): void {
    this.matrimonioService.creaMatrimonio(request).subscribe({
      next: () => {
        this.success.set('Matrimonio creato con successo!');
        this.isEdit.set(true);
        this.saving.set(false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante il salvataggio');
        this.saving.set(false);
      }
    });
  }

  private updateMatrimonio(request: AggiornaMatrimonioRequest): void {
    this.matrimonioService.aggiornaMatrimonio(request).subscribe({
      next: () => {
        this.success.set('Modifiche salvate con successo!');
        this.saving.set(false);
        this.editMode.set(false);
        this.loadMatrimonioData(); // Reload data
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante il salvataggio');
        this.saving.set(false);
      }
    });
  }

  private loadMatrimonioData(): void {
    this.matrimonioService.getMatrimonio().subscribe({
      next: (matrimonio) => {
        if (matrimonio) {
          this.matrimonio.set(matrimonio);
          this.patchForm(matrimonio);
        }
      }
    });
  }

  enableEditMode(): void {
    this.editMode.set(true);
  }

  cancelEdit(): void {
    if (this.matrimonio()) {
      this.patchForm(this.matrimonio()!);
    }
    this.editMode.set(false);
    this.error.set(null);
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteMatrimonio(): void {
    this.deleting.set(true);
    this.error.set(null);

    this.matrimonioService.eliminaMatrimonio().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'eliminazione');
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  get f() {
    return this.matrimonioForm.controls;
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
}
