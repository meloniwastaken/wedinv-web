import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvitatoService, AuthService } from '../../../core/services';
import { InvitatoDTO, CreaInvitatoRequest, AggiornaInvitatoRequest, StatoInvito, AccompagnatoreDTO } from '../../../core/models';

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
  editMode = signal(false);
  invitato = signal<InvitatoDTO | null>(null);
  invitatoId: string | null = null;

  statiInvito = [
    { id: StatoInvito.DA_INVIARE, descrizione: 'Da inviare' },
    { id: StatoInvito.INVIATO, descrizione: 'Inviato' },
    { id: StatoInvito.CONFERMATO, descrizione: 'Confermato' },
    { id: StatoInvito.RIFIUTATO, descrizione: 'Rifiutato' }
  ];

  isPremium = computed(() => this.authService.isActive());
  canCreate = signal(true);

  constructor(
    private fb: FormBuilder,
    private invitatoService: InvitatoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.invitatoForm = this.createForm();
  }

  ngOnInit(): void {
    this.invitatoId = this.route.snapshot.paramMap.get('id');

    if (this.invitatoId && this.invitatoId !== 'nuovo') {
      this.isEdit.set(true);
      this.editMode.set(false); // Start in view mode for existing guests
      this.loadInvitato(this.invitatoId);
    } else {
      this.editMode.set(true); // New guest starts in edit mode
      // Check if FREE user can create more invites
      if (!this.isPremium()) {
        this.checkCanCreate();
      } else {
        this.loading.set(false);
      }
    }
  }

  private checkCanCreate(): void {
    this.invitatoService.getInvitatiRiepilogo().subscribe({
      next: (data) => {
        const count = data.invitati?.length || 0;
        if (count >= 3) {
          this.canCreate.set(false);
          this.error.set('Hai raggiunto il limite di 3 invitati per il piano gratuito. Passa a Premium per invitare più ospiti.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
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
      note: [''],
      intolleranzeAlimentari: [''],
      accompagnatori: this.fb.array([])
    });
  }

  get accompagnatoriFormArray(): FormArray {
    return this.invitatoForm.get('accompagnatori') as FormArray;
  }

  createAccompagnatoreGroup(acc?: AccompagnatoreDTO): FormGroup {
    return this.fb.group({
      nome: [acc?.nome || '', Validators.required],
      cognome: [acc?.cognome || '', Validators.required]
    });
  }

  addAccompagnatore(): void {
    this.accompagnatoriFormArray.push(this.createAccompagnatoreGroup());
  }

  removeAccompagnatore(index: number): void {
    this.accompagnatoriFormArray.removeAt(index);
    // Aggiorna anche plusConfermati quando si rimuove un accompagnatore
    const newCount = this.accompagnatoriFormArray.length;
    this.invitatoForm.patchValue({ plusConfermati: newCount });
  }

  onPlusConfermatiChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10) || 0;
    const maxConsentiti = this.invitatoForm.get('numeroPlusConsentiti')?.value || 0;

    // Validazione: non superare il massimo consentito
    if (value > maxConsentiti) {
      value = maxConsentiti;
      this.invitatoForm.patchValue({ plusConfermati: value });
    }

    this.syncAccompagnatori(value);
  }

  onNumeroPlusConsentitiChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const maxConsentiti = parseInt(input.value, 10) || 0;
    const plusConfermati = this.invitatoForm.get('plusConfermati')?.value || 0;

    // Se plusConfermati supera il nuovo max, lo riduciamo
    if (plusConfermati > maxConsentiti) {
      this.invitatoForm.patchValue({ plusConfermati: maxConsentiti });
      this.syncAccompagnatori(maxConsentiti);
    }
  }

  private syncAccompagnatori(count: number): void {
    const current = this.accompagnatoriFormArray.length;
    if (count > current) {
      // Aggiungi nuovi accompagnatori vuoti
      for (let i = current; i < count; i++) {
        this.accompagnatoriFormArray.push(this.createAccompagnatoreGroup());
      }
    } else if (count < current) {
      // Rimuovi accompagnatori in eccesso
      for (let i = current - 1; i >= count; i--) {
        this.accompagnatoriFormArray.removeAt(i);
      }
    }
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
      note: invitato.note || '',
      intolleranzeAlimentari: invitato.intolleranzeAlimentari || ''
    });

    // Popola FormArray accompagnatori
    this.accompagnatoriFormArray.clear();
    if (invitato.accompagnatori && invitato.accompagnatori.length > 0) {
      invitato.accompagnatori.forEach(acc => {
        this.accompagnatoriFormArray.push(this.createAccompagnatoreGroup(acc));
      });
    }
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
    // Prepara accompagnatori
    const accompagnatori = formValue.accompagnatori
      ?.filter((a: any) => a.nome?.trim() && a.cognome?.trim())
      ?.map((a: any) => ({ nome: a.nome.trim(), cognome: a.cognome.trim() })) || [];

    const request: AggiornaInvitatoRequest = {
      nome: formValue.nome,
      cognome: formValue.cognome,
      email: formValue.email,
      telefono: formValue.telefono || null,
      numeroPlusConsentiti: formValue.numeroPlusConsentiti || null,
      statoInvito: formValue.statoInvito,
      plusConfermati: formValue.plusConfermati || null,
      note: formValue.note || null,
      intolleranzeAlimentari: formValue.intolleranzeAlimentari || null,
      accompagnatori: accompagnatori
    };

    this.invitatoService.aggiornaInvitato(this.invitatoId!, request).subscribe({
      next: () => {
        this.success.set('Modifiche salvate con successo!');
        this.saving.set(false);
        this.editMode.set(false);
        this.loadInvitato(this.invitatoId!); // Reload data
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

  enableEditMode(): void {
    this.editMode.set(true);
  }

  cancelEdit(): void {
    if (this.invitato()) {
      this.patchForm(this.invitato()!);
    }
    this.editMode.set(false);
    this.error.set(null);
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

  getStatoBadgeClass(statoInvito: number | null): string {
    switch (statoInvito) {
      case StatoInvito.CONFERMATO:
        return 'bg-success';
      case StatoInvito.RIFIUTATO:
        return 'bg-danger';
      case StatoInvito.INVIATO:
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getStatoDescrizione(statoInvito: number | null): string {
    const stato = this.statiInvito.find(s => s.id === statoInvito);
    return stato?.descrizione ?? 'Da inviare';
  }
}
