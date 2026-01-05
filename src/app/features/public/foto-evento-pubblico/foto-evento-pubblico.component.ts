import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InvitoPubblicoService, ThemeService, TitleService, FotoEventoService } from '../../../core/services';
import { InvitoPubblicoResponse, FotoEventoListResponse, FotoEventoDTO } from '../../../core/models';
import { NavbarPubblicoComponent } from '../../../shared/components/navbar-pubblico/navbar-pubblico.component';

interface PendingUpload {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

@Component({
  selector: 'app-foto-evento-pubblico',
  standalone: true,
  imports: [CommonModule, NavbarPubblicoComponent],
  templateUrl: './foto-evento-pubblico.component.html',
  styleUrl: './foto-evento-pubblico.component.css'
})
export class FotoEventoPubblicoComponent implements OnInit {
  loading = signal(true);
  invito = signal<InvitoPubblicoResponse | null>(null);
  fotoData = signal<FotoEventoListResponse | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  invitoId: string = '';

  // Modal upload
  showUploadModal = signal(false);
  isDragging = signal(false);
  pendingUploads = signal<PendingUpload[]>([]);
  isUploading = signal(false);
  uploadProgress = signal(0);

  // Modal conferma eliminazione
  showDeleteModal = signal(false);
  fotoToDelete = signal<FotoEventoDTO | null>(null);
  isDeleting = signal(false);

  // Flag per navbar
  hasListaNozze = signal(false);

  // Grid: mostra sempre 12 slot
  readonly MAX_SLOTS = 12;

  // Array di slot per la griglia
  gridSlots = computed(() => {
    const foto = this.fotoData()?.foto || [];
    const slots: (FotoEventoDTO | null)[] = [];

    // Riempi con le foto esistenti
    for (const f of foto) {
      slots.push(f);
    }

    // Riempi con slot vuoti fino a MAX_SLOTS
    while (slots.length < this.MAX_SLOTS) {
      slots.push(null);
    }

    return slots;
  });

  // Numero di foto che posso ancora caricare
  remainingUploads = computed(() => {
    const data = this.fotoData();
    if (!data) return 0;
    return data.maxFotoPerInvitato - data.fotoCaricateDaMe;
  });

  constructor(
    private invitoPubblicoService: InvitoPubblicoService,
    private fotoEventoService: FotoEventoService,
    private themeService: ThemeService,
    private titleService: TitleService,
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
        this.titleService.setTitleWithSposi(invito.nomeSposoA, invito.nomeSposoB);
        // Carica foto
        this.loadFoto();
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

  private loadFoto(): void {
    this.fotoEventoService.getFotoEvento(this.invitoId).subscribe({
      next: (data) => {
        this.fotoData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Errore nel caricamento delle foto');
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

  // === Upload Modal ===
  openUploadModal(): void {
    if (!this.fotoData()?.uploadAbilitato) {
      this.error.set("L'upload delle foto sarà disponibile dalla data dell'evento");
      setTimeout(() => this.error.set(null), 3000);
      return;
    }

    if (this.remainingUploads() <= 0) {
      this.error.set('Hai raggiunto il limite massimo di foto');
      setTimeout(() => this.error.set(null), 3000);
      return;
    }

    this.pendingUploads.set([]);
    this.showUploadModal.set(true);
  }

  closeUploadModal(): void {
    if (this.isUploading()) return;
    this.showUploadModal.set(false);
    this.pendingUploads.set([]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
    input.value = '';
  }

  private processFiles(files: FileList): void {
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const remaining = this.remainingUploads();
    const current = this.pendingUploads();

    let added = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length && (current.length + added) < remaining; i++) {
      const file = files[i];

      if (!validFormats.includes(file.type)) {
        errors.push(`${file.name}: formato non supportato`);
        continue;
      }

      if (file.size > maxSize) {
        errors.push(`${file.name}: supera i 5MB`);
        continue;
      }

      // Crea preview
      const preview = URL.createObjectURL(file);
      current.push({
        file,
        preview,
        status: 'pending'
      });
      added++;
    }

    if (files.length > remaining - current.length + added) {
      errors.push(`Puoi caricare ancora ${remaining} foto`);
    }

    this.pendingUploads.set([...current]);

    if (errors.length > 0) {
      this.error.set(errors.join('. '));
      setTimeout(() => this.error.set(null), 5000);
    }
  }

  removePendingUpload(index: number): void {
    const current = [...this.pendingUploads()];
    URL.revokeObjectURL(current[index].preview);
    current.splice(index, 1);
    this.pendingUploads.set(current);
  }

  async startUpload(): Promise<void> {
    const pending = this.pendingUploads();
    if (pending.length === 0) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < pending.length; i++) {
      const upload = pending[i];

      // Aggiorna stato a uploading
      const updated = [...pending];
      updated[i] = { ...upload, status: 'uploading' };
      this.pendingUploads.set(updated);

      try {
        const base64 = await this.fileToBase64(upload.file);
        await this.uploadSinglePhoto(base64, upload.file.name);

        // Aggiorna stato a done
        const done = [...this.pendingUploads()];
        done[i] = { ...done[i], status: 'done' };
        this.pendingUploads.set(done);
        successCount++;
      } catch (err: any) {
        // Aggiorna stato a error
        const errored = [...this.pendingUploads()];
        errored[i] = { ...errored[i], status: 'error', error: err.message || 'Errore upload' };
        this.pendingUploads.set(errored);
        errorCount++;
      }

      this.uploadProgress.set(Math.round(((i + 1) / pending.length) * 100));
    }

    this.isUploading.set(false);

    if (successCount > 0) {
      this.success.set(`${successCount} foto caricate con successo!`);
      setTimeout(() => this.success.set(null), 3000);
      // Ricarica le foto
      this.loadFoto();
    }

    if (errorCount === 0) {
      // Chiudi modal se tutto ok
      setTimeout(() => {
        this.showUploadModal.set(false);
        this.pendingUploads.set([]);
      }, 1000);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Errore lettura file'));
      reader.readAsDataURL(file);
    });
  }

  private uploadSinglePhoto(base64: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fotoEventoService.uploadFoto(this.invitoId, {
        fotoBase64: base64,
        nomeFile: filename
      }).subscribe({
        next: () => resolve(),
        error: (err) => reject(new Error(err.error?.message || 'Errore upload'))
      });
    });
  }

  // === Delete Modal ===
  openDeleteModal(foto: FotoEventoDTO): void {
    this.fotoToDelete.set(foto);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) return;
    this.showDeleteModal.set(false);
    this.fotoToDelete.set(null);
  }

  confirmDelete(): void {
    const foto = this.fotoToDelete();
    if (!foto) return;

    this.isDeleting.set(true);

    this.fotoEventoService.deleteFoto(this.invitoId, foto.id).subscribe({
      next: () => {
        this.success.set('Foto eliminata');
        setTimeout(() => this.success.set(null), 3000);
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.fotoToDelete.set(null);
        this.loadFoto();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'eliminazione');
        this.isDeleting.set(false);
      }
    });
  }

  // Verifica se una foto è mia (posso eliminarla)
  isMyPhoto(foto: FotoEventoDTO): boolean {
    const inv = this.invito();
    if (!inv) return false;
    return foto.nomeInvitato === inv.nomeInvitato && foto.cognomeInvitato === inv.cognomeInvitato;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
