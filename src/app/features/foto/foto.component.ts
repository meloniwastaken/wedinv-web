import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FotoEventoService } from '../../core/services';
import { FotoEventoAdminResponse, FotoEventoDTO, InvitatoConFoto } from '../../core/models';

interface PendingUpload {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

@Component({
  selector: 'app-foto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './foto.component.html',
  styleUrl: './foto.component.css'
})
export class FotoComponent implements OnInit {
  loading = signal(true);
  fotoData = signal<FotoEventoAdminResponse | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Upload modal
  showUploadModal = signal(false);
  isDragging = signal(false);
  pendingUploads = signal<PendingUpload[]>([]);
  isUploading = signal(false);
  uploadProgress = signal(0);

  // Delete modal
  showDeleteModal = signal(false);
  fotoToDelete = signal<FotoEventoDTO | null>(null);
  isDeleting = signal(false);

  // Image viewer modal
  showViewerModal = signal(false);
  viewerPhotos = signal<FotoEventoDTO[]>([]);
  viewerCurrentIndex = signal(0);
  viewerTitle = signal('');

  // Invitato detail modal
  showInvitatoModal = signal(false);
  selectedInvitato = signal<InvitatoConFoto | null>(null);

  constructor(private fotoEventoService: FotoEventoService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.fotoEventoService.getFotoEventoAdmin().subscribe({
      next: (data) => {
        this.fotoData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore nel caricamento delle foto');
        this.loading.set(false);
      }
    });
  }

  // === Upload Modal ===
  openUploadModal(): void {
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
    const current = this.pendingUploads();
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!validFormats.includes(file.type)) {
        errors.push(`${file.name}: formato non supportato`);
        continue;
      }

      if (file.size > maxSize) {
        errors.push(`${file.name}: supera i 5MB`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      current.push({
        file,
        preview,
        status: 'pending'
      });
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

      const updated = [...pending];
      updated[i] = { ...upload, status: 'uploading' };
      this.pendingUploads.set(updated);

      try {
        const base64 = await this.fileToBase64(upload.file);
        await this.uploadSinglePhoto(base64, upload.file.name);

        const done = [...this.pendingUploads()];
        done[i] = { ...done[i], status: 'done' };
        this.pendingUploads.set(done);
        successCount++;
      } catch (err: any) {
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
      this.loadData();
    }

    if (errorCount === 0) {
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
      this.fotoEventoService.uploadFotoSposi({
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

    this.fotoEventoService.deleteFotoAdmin(foto.id).subscribe({
      next: () => {
        this.success.set('Foto eliminata');
        setTimeout(() => this.success.set(null), 3000);
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.fotoToDelete.set(null);
        this.loadData();

        // Update viewer if open
        if (this.showViewerModal()) {
          const photos = this.viewerPhotos().filter(p => p.id !== foto.id);
          if (photos.length === 0) {
            this.closeViewerModal();
          } else {
            this.viewerPhotos.set(photos);
            if (this.viewerCurrentIndex() >= photos.length) {
              this.viewerCurrentIndex.set(photos.length - 1);
            }
          }
        }

        // Update invitato modal if open
        if (this.showInvitatoModal() && this.selectedInvitato()) {
          const invitato = this.selectedInvitato()!;
          const updatedFoto = invitato.foto.filter(p => p.id !== foto.id);
          if (updatedFoto.length === 0) {
            this.closeInvitatoModal();
          } else {
            this.selectedInvitato.set({
              ...invitato,
              foto: updatedFoto,
              numeroFoto: updatedFoto.length
            });
          }
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante l\'eliminazione');
        this.isDeleting.set(false);
      }
    });
  }

  // === Image Viewer Modal ===
  openViewerModal(photos: FotoEventoDTO[], index: number, title: string): void {
    this.viewerPhotos.set(photos);
    this.viewerCurrentIndex.set(index);
    this.viewerTitle.set(title);
    this.showViewerModal.set(true);
  }

  closeViewerModal(): void {
    this.showViewerModal.set(false);
    this.viewerPhotos.set([]);
  }

  viewerPrev(): void {
    const current = this.viewerCurrentIndex();
    const total = this.viewerPhotos().length;
    this.viewerCurrentIndex.set(current > 0 ? current - 1 : total - 1);
  }

  viewerNext(): void {
    const current = this.viewerCurrentIndex();
    const total = this.viewerPhotos().length;
    this.viewerCurrentIndex.set(current < total - 1 ? current + 1 : 0);
  }

  get viewerCurrentPhoto(): FotoEventoDTO | null {
    const photos = this.viewerPhotos();
    const index = this.viewerCurrentIndex();
    return photos[index] || null;
  }

  // Open viewer for sposi photos
  openSposiViewer(index: number): void {
    const photos = this.fotoData()?.fotoSposi || [];
    this.openViewerModal(photos, index, 'Le nostre foto');
  }

  // Open viewer for invitato photos
  openInvitatoViewer(invitato: InvitatoConFoto, index: number): void {
    this.openViewerModal(invitato.foto, index, `Foto di ${invitato.nome} ${invitato.cognome}`);
  }

  // === Invitato Detail Modal ===
  openInvitatoModal(invitato: InvitatoConFoto): void {
    this.selectedInvitato.set(invitato);
    this.showInvitatoModal.set(true);
  }

  closeInvitatoModal(): void {
    this.showInvitatoModal.set(false);
    this.selectedInvitato.set(null);
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
