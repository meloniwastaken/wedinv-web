import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvitatoService } from '../../../core/services';
import { InvitatoDTO, CreaInvitatoRequest, AggiornaInvitatoRequest, StatoInvito } from '../../../core/models';

@Component({
  selector: 'app-dettaglio-invitato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dettaglio-invitato.component.html',
  styleUrl: './dettaglio-invitato.component.css'
})
export class DettaglioInvitatoComponent implements OnInit {
  invitatoForm: FormGroup;
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  isEdit = signal(false);
  invitato = signal<InvitatoDTO | null>(null);
  invitatoId: string | null = null;

  statiInvito = [
    { id: StatoInvito.DA_INVIARE, descrizione: 'Da inviare' },
    { id: StatoInvito.INVIATO, descrizione: 'Inviato' },
    { id: StatoInvito.CONFERMATO, descrizione: 'Confermato' },
    { id: StatoInvito.RIFIUTATO, descrizione: 'Rifiutato' }
  ];

  constructor(
    private fb: FormBuilder,
    private invitatoService: InvitatoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.invitatoForm = this.createForm();
  }

  ngOnInit(): void {
    this.invitatoId = this.route.snapshot.paramMap.get('id');

    if (this.invitatoId && this.invitatoId !== 'nuovo') {
      this.isEdit.set(true);
      this.loadInvitato(this.invitatoId);
    } else {
      this.loading.set(false);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cognome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      numeroPlusConsentiti: [0, [Validators.min(0)]],
      statoInvito: [StatoInvito.DA_INVIARE],
      plusConfermati: [0, [Validators.min(0)]],
      note: ['']
    });
  }

  private loadInvitato(id: string): void {
    this.invitatoService.getInvitato(id).subscribe({
      next: (invitato) => {
        this.invitato.set(invitato);
        this.patchForm(invitato);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Invitato non trovato');
        } else {
          this.error.set('Errore nel caricamento dei dati');
        }
        this.loading.set(false);
      }
    });
  }

  private patchForm(invitato: InvitatoDTO): void {
    this.invitatoForm.patchValue({
      nome: invitato.nome,
      cognome: invitato.cognome,
      email: invitato.email,
      telefono: invitato.telefono || '',
      numeroPlusConsentiti: invitato.numeroPlusConsentiti || 0,
      statoInvito: invitato.statoInvito || StatoInvito.DA_INVIARE,
      plusConfermati: invitato.plusConfermati || 0,
      note: invitato.note || ''
    });
  }

  onSubmit(): void {
    if (this.invitatoForm.invalid) {
      this.invitatoForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.invitatoForm.value;

    if (this.isEdit() && this.invitatoId) {
      this.updateInvitato(formValue);
    } else {
      this.createInvitato(formValue);
    }
  }

  private createInvitato(formValue: any): void {
    const request: CreaInvitatoRequest = {
      nome: formValue.nome,
      cognome: formValue.cognome,
      email: formValue.email,
      telefono: formValue.telefono || null,
      numeroPlusConsentiti: formValue.numeroPlusConsentiti || null,
      note: formValue.note || null
    };

    this.invitatoService.creaInvitato(request).subscribe({
      next: () => {
        this.success.set('Invitato creato con successo!');
        this.saving.set(false);
        setTimeout(() => {
          this.router.navigate(['/invitati']);
        }, 1500);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante il salvataggio');
        this.saving.set(false);
      }
    });
  }

  private updateInvitato(formValue: any): void {
    const request: AggiornaInvitatoRequest = {
      nome: formValue.nome,
      cognome: formValue.cognome,
      email: formValue.email,
      telefono: formValue.telefono || null,
      numeroPlusConsentiti: formValue.numeroPlusConsentiti || null,
      statoInvito: formValue.statoInvito,
      plusConfermati: formValue.plusConfermati || null,
      note: formValue.note || null
    };

    this.invitatoService.aggiornaInvitato(this.invitatoId!, request).subscribe({
      next: () => {
        this.success.set('Modifiche salvate con successo!');
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante il salvataggio');
        this.saving.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/invitati']);
  }

  get f() {
    return this.invitatoForm.controls;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
