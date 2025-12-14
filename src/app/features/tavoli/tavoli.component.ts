import { Component, OnInit, signal, computed, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TavoloService } from '../../core/services';
import { TavoloDTO, PersonaTavoloDTO, TipoTavolo, CreaTavoloRequest } from '../../core/models';

interface DragData {
  type: 'persona' | 'tavolo';
  persona?: PersonaTavoloDTO;
  tavolo?: TavoloDTO;
  offsetX?: number;
  offsetY?: number;
}

@Component({
  selector: 'app-tavoli',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tavoli.component.html',
  styleUrl: './tavoli.component.css'
})
export class TavoliComponent implements OnInit {
  @ViewChild('gridArea') gridArea!: ElementRef<HTMLDivElement>;

  // Breakpoint mobile (992px = Bootstrap lg)
  private readonly MOBILE_BREAKPOINT = 992;
  isMobile = signal(false);

  loading = signal(true);
  error = signal<string | null>(null);
  hasMatrimonio = signal(true);
  tavoli = signal<TavoloDTO[]>([]);
  personeAssegnabili = signal<PersonaTavoloDTO[]>([]);
  searchTerm = signal('');
  showOnlyConfermati = signal(true);

  selectedTavolo = signal<TavoloDTO | null>(null);
  editingTavoloNome = signal(false);
  tempNomeTavolo = signal('');

  showNewTavoloModal = signal(false);
  newTavoloTipo = signal<number>(TipoTavolo.CIRCOLARE);
  newTavoloNome = signal('');
  newTavoloPosti = signal<number>(8);
  newTavoloDiametro = signal<number>(120); // Per tavoli circolari
  newTavoloLarghezza = signal<number>(180); // Per tavoli rettangolari
  newTavoloAltezza = signal<number>(100); // Per tavoli rettangolari

  TipoTavolo = TipoTavolo;

  // Tracciamento elemento in trascinamento
  draggingPersonaId = signal<string | null>(null);
  draggingTavoloId = signal<string | null>(null);

  private dragData: DragData | null = null;

  filteredPersone = computed(() => {
    const persone = this.personeAssegnabili();
    const term = this.searchTerm().toLowerCase();
    const onlyConfermati = this.showOnlyConfermati();

    return persone.filter(p => {
      const matchSearch = !term ||
        p.nome.toLowerCase().includes(term) ||
        p.cognome.toLowerCase().includes(term) ||
        (p.invitatorePrincipale?.toLowerCase().includes(term) ?? false);

      const matchConfermato = !onlyConfermati || p.confermato;

      return matchSearch && matchConfermato;
    });
  });

  constructor(private tavoloService: TavoloService) {}

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  ngOnInit(): void {
    this.checkMobile();
    this.loadData();
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth < this.MOBILE_BREAKPOINT);
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    const selectedId = this.selectedTavolo()?.id;

    Promise.all([
      this.tavoloService.getTavoli().toPromise(),
      this.tavoloService.getPersoneAssegnabili().toPromise()
    ]).then(([tavoliResponse, persone]) => {
      this.hasMatrimonio.set(tavoliResponse?.hasMatrimonio ?? false);
      this.tavoli.set(tavoliResponse?.tavoli || []);
      this.personeAssegnabili.set(persone || []);

      // Aggiorna il tavolo selezionato con i nuovi dati
      if (selectedId) {
        const updatedTavolo = (tavoliResponse?.tavoli || []).find(t => t.id === selectedId);
        this.selectedTavolo.set(updatedTavolo || null);
      }

      this.loading.set(false);
    }).catch(err => {
      this.error.set(err.error?.message || 'Errore nel caricamento dei dati');
      this.loading.set(false);
    });
  }

  // Drag & Drop persone
  onPersonaDragStart(event: DragEvent, persona: PersonaTavoloDTO): void {
    this.dragData = { type: 'persona', persona };
    this.draggingPersonaId.set(persona.id);
    event.dataTransfer?.setData('text/plain', JSON.stringify({ type: 'persona', id: persona.id }));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onTavoloDragOver(event: DragEvent): void {
    if (this.dragData?.type === 'persona') {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'move';
    }
  }

  onTavoloDrop(event: DragEvent, tavolo: TavoloDTO): void {
    event.preventDefault();
    if (this.dragData?.type === 'persona' && this.dragData.persona) {
      const persona = this.dragData.persona;

      // Calcola la posizione del drop relativa al tavolo
      const tavoloElement = event.currentTarget as HTMLElement;
      const tavoloRect = tavoloElement.getBoundingClientRect();
      const dropX = event.clientX - tavoloRect.left;
      const dropY = event.clientY - tavoloRect.top;

      // Calcola la posizione sul bordo del tavolo
      const borderPos = this.calculateBorderPosition(dropX, dropY, tavolo);

      this.tavoloService.assegnaPersonaATavolo(tavolo.id, {
        personaId: persona.id,
        accompagnatore: persona.accompagnatore,
        posX: borderPos.x,
        posY: borderPos.y
      }).subscribe({
        next: () => this.loadData(),
        error: (err) => this.error.set(err.error?.message || 'Errore nell\'assegnazione')
      });
    }
    this.dragData = null;
    this.draggingPersonaId.set(null);
    this.draggingTavoloId.set(null);
  }

  // Calcola la posizione sul bordo del tavolo più vicina al punto di drop
  private calculateBorderPosition(dropX: number, dropY: number, tavolo: TavoloDTO): { x: number; y: number } {
    const isCircular = tavolo.tipoTavolo === TipoTavolo.CIRCOLARE;
    const width = tavolo.larghezza || (isCircular ? 120 : 180);
    const height = tavolo.altezza || (isCircular ? 120 : 100);
    const centerX = width / 2;
    const centerY = height / 2;

    if (isCircular) {
      // Per tavoli circolari: proietta il punto sul cerchio
      const radius = Math.max(width, height) / 2 + 20; // Raggio esterno per le persone
      const angle = Math.atan2(dropY - centerY, dropX - centerX);
      const x = centerX + radius * Math.cos(angle) - 16;
      const y = centerY + radius * Math.sin(angle) - 16;
      return { x, y };
    } else {
      // Per tavoli rettangolari: trova il lato più vicino e proietta
      const relX = dropX - centerX;
      const relY = dropY - centerY;

      // Determina quale lato è più vicino
      const ratioX = Math.abs(relX) / (width / 2);
      const ratioY = Math.abs(relY) / (height / 2);

      let x: number, y: number;

      if (ratioX > ratioY) {
        // Lati sinistro o destro
        if (relX > 0) {
          x = width - 8;
          y = Math.max(0, Math.min(height, dropY)) - 16;
        } else {
          x = -24;
          y = Math.max(0, Math.min(height, dropY)) - 16;
        }
      } else {
        // Lati superiore o inferiore
        if (relY > 0) {
          x = Math.max(0, Math.min(width, dropX)) - 16;
          y = height - 8;
        } else {
          x = Math.max(0, Math.min(width, dropX)) - 16;
          y = -24;
        }
      }

      return { x, y };
    }
  }

  // Drag tavolo nella griglia
  onTavoloDragStart(event: DragEvent, tavolo: TavoloDTO): void {
    this.draggingTavoloId.set(tavolo.id);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragData = {
      type: 'tavolo',
      tavolo,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    event.dataTransfer?.setData('text/plain', JSON.stringify({ type: 'tavolo', id: tavolo.id }));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onGridDragOver(event: DragEvent): void {
    if (this.dragData?.type === 'tavolo') {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'move';
    }
  }

  onGridDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.dragData?.type === 'tavolo' && this.dragData.tavolo && this.gridArea) {
      const gridRect = this.gridArea.nativeElement.getBoundingClientRect();
      const newX = event.clientX - gridRect.left - (this.dragData.offsetX || 0);
      const newY = event.clientY - gridRect.top - (this.dragData.offsetY || 0);

      // Limita alle dimensioni della griglia
      const maxX = gridRect.width - (this.dragData.tavolo.larghezza || 100);
      const maxY = gridRect.height - (this.dragData.tavolo.altezza || 100);

      const posX = Math.max(0, Math.min(newX, maxX));
      const posY = Math.max(0, Math.min(newY, maxY));

      const tavoloId = this.dragData.tavolo.id;

      // Aggiorna posizione localmente (senza spinner)
      this.tavoli.update(tavoli =>
        tavoli.map(t => t.id === tavoloId ? { ...t, posX, posY } : t)
      );

      // Aggiorna anche il tavolo selezionato se è quello spostato
      if (this.selectedTavolo()?.id === tavoloId) {
        this.selectedTavolo.update(t => t ? { ...t, posX, posY } : null);
      }

      // Salva su backend (silenziosamente)
      this.tavoloService.aggiornaPosizioneTavolo(tavoloId, posX, posY).subscribe({
        error: (err) => {
          this.error.set(err.error?.message || 'Errore nello spostamento');
          this.loadData(); // Ricarica solo in caso di errore
        }
      });
    }
    this.dragData = null;
    this.draggingPersonaId.set(null);
    this.draggingTavoloId.set(null);
  }

  onDragEnd(): void {
    this.dragData = null;
    this.draggingPersonaId.set(null);
    this.draggingTavoloId.set(null);
  }

  // Gestione tavoli
  openNewTavoloModal(): void {
    this.newTavoloTipo.set(TipoTavolo.CIRCOLARE);
    this.newTavoloNome.set('');
    this.newTavoloPosti.set(8);
    this.newTavoloDiametro.set(120);
    this.newTavoloLarghezza.set(180);
    this.newTavoloAltezza.set(100);
    this.showNewTavoloModal.set(true);
  }

  closeNewTavoloModal(): void {
    this.showNewTavoloModal.set(false);
  }

  createTavolo(): void {
    const isCircolare = this.newTavoloTipo() === TipoTavolo.CIRCOLARE;
    const larghezza = isCircolare ? this.newTavoloDiametro() : this.newTavoloLarghezza();
    const altezza = isCircolare ? this.newTavoloDiametro() : this.newTavoloAltezza();

    const request: CreaTavoloRequest = {
      nome: this.newTavoloNome() || undefined,
      tipoTavolo: this.newTavoloTipo(),
      posX: 50,
      posY: 50,
      larghezza,
      altezza,
      numeroPosti: this.newTavoloPosti()
    };

    this.tavoloService.creaTavolo(request).subscribe({
      next: () => {
        this.closeNewTavoloModal();
        this.loadData();
      },
      error: (err) => this.error.set(err.error?.message || 'Errore nella creazione del tavolo')
    });
  }

  selectTavolo(tavolo: TavoloDTO, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedTavolo.set(tavolo);
    this.editingTavoloNome.set(false);
  }

  deselectTavolo(): void {
    this.selectedTavolo.set(null);
    this.editingTavoloNome.set(false);
  }

  onGridClick(event: MouseEvent): void {
    // Deseleziona solo se il click è direttamente sulla griglia (non su un tavolo)
    if (event.target === event.currentTarget) {
      this.deselectTavolo();
    }
  }

  startEditNome(): void {
    const tavolo = this.selectedTavolo();
    if (tavolo) {
      this.tempNomeTavolo.set(tavolo.nome || '');
      this.editingTavoloNome.set(true);
    }
  }

  saveNomeTavolo(): void {
    const tavolo = this.selectedTavolo();
    if (tavolo) {
      this.tavoloService.aggiornaTavolo(tavolo.id, {
        nome: this.tempNomeTavolo(),
        tipoTavolo: tavolo.tipoTavolo,
        posX: tavolo.posX ?? undefined,
        posY: tavolo.posY ?? undefined,
        larghezza: tavolo.larghezza ?? undefined,
        altezza: tavolo.altezza ?? undefined,
        numeroPosti: tavolo.numeroPosti ?? undefined
      }).subscribe({
        next: () => {
          this.editingTavoloNome.set(false);
          this.loadData();
        },
        error: (err) => this.error.set(err.error?.message || 'Errore nel salvataggio')
      });
    }
  }

  cancelEditNome(): void {
    this.editingTavoloNome.set(false);
  }

  deleteTavolo(tavolo: TavoloDTO): void {
    if (!confirm(`Sei sicuro di voler eliminare il tavolo "${tavolo.nome || 'Senza nome'}"?`)) {
      return;
    }

    this.tavoloService.eliminaTavolo(tavolo.id).subscribe({
      next: () => {
        this.deselectTavolo();
        this.loadData();
      },
      error: (err) => this.error.set(err.error?.message || 'Errore nell\'eliminazione')
    });
  }

  removePersonaFromTavolo(persona: PersonaTavoloDTO, tavolo: TavoloDTO): void {
    this.tavoloService.rimuoviPersonaDaTavolo(tavolo.id, persona.id, persona.accompagnatore).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error.set(err.error?.message || 'Errore nella rimozione')
    });
  }

  distribuisciPersone(tavolo: TavoloDTO): void {
    const persone = tavolo.persone;
    if (!persone || persone.length < 2) return;

    const isCircular = tavolo.tipoTavolo === TipoTavolo.CIRCOLARE;
    const width = tavolo.larghezza || (isCircular ? 120 : 180);
    const height = tavolo.altezza || (isCircular ? 120 : 100);
    const total = persone.length;

    // Calcola le nuove posizioni distribuite uniformemente
    const updates: Promise<void>[] = [];

    persone.forEach((persona, index) => {
      let x: number, y: number;

      if (isCircular) {
        // Distribuzione circolare
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const radius = Math.max(width, height) / 2 + 20;
        const centerX = width / 2;
        const centerY = height / 2;
        x = centerX + radius * Math.cos(angle) - 16;
        y = centerY + radius * Math.sin(angle) - 16;
      } else {
        // Distribuzione rettangolare lungo il perimetro
        const perimeter = 2 * (width + height);
        const position = (index / total) * perimeter;

        if (position < width) {
          // Lato superiore
          x = position - 16;
          y = -24;
        } else if (position < width + height) {
          // Lato destro
          x = width - 8;
          y = position - width - 16;
        } else if (position < 2 * width + height) {
          // Lato inferiore
          x = width - (position - width - height) - 16;
          y = height - 8;
        } else {
          // Lato sinistro
          x = -24;
          y = height - (position - 2 * width - height) - 16;
        }
      }

      updates.push(
        this.tavoloService.aggiornaPosizionePersonaSuTavolo(
          tavolo.id, persona.id, persona.accompagnatore, x, y
        ).toPromise().then(() => {})
      );
    });

    Promise.all(updates).then(() => {
      this.loadData();
    }).catch(err => {
      this.error.set(err.error?.message || 'Errore nella distribuzione');
    });
  }

  // Helpers
  getTavoloStyle(tavolo: TavoloDTO): Record<string, string> {
    const isCircular = tavolo.tipoTavolo === TipoTavolo.CIRCOLARE;
    return {
      'left': `${tavolo.posX || 0}px`,
      'top': `${tavolo.posY || 0}px`,
      'width': `${tavolo.larghezza || (isCircular ? 120 : 180)}px`,
      'height': `${tavolo.altezza || (isCircular ? 120 : 100)}px`,
      'border-radius': isCircular ? '50%' : '8px'
    };
  }

  getPersonaPosition(persona: PersonaTavoloDTO, index: number, total: number, tavolo: TavoloDTO): Record<string, string> {
    // Se la persona ha una posizione salvata, usala
    if (persona.posX !== null && persona.posY !== null) {
      return { 'left': `${persona.posX}px`, 'top': `${persona.posY}px` };
    }

    // Altrimenti calcola una posizione di default
    const isCircular = tavolo.tipoTavolo === TipoTavolo.CIRCOLARE;
    const width = tavolo.larghezza || (isCircular ? 120 : 180);
    const height = tavolo.altezza || (isCircular ? 120 : 100);

    if (isCircular) {
      // Disponi le persone in cerchio attorno al tavolo
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      const radius = Math.max(width, height) / 2 + 20;
      const centerX = width / 2;
      const centerY = height / 2;
      const x = centerX + radius * Math.cos(angle) - 16;
      const y = centerY + radius * Math.sin(angle) - 16;
      return { 'left': `${x}px`, 'top': `${y}px` };
    } else {
      // Disponi lungo il perimetro del rettangolo
      const perimeter = 2 * (width + height);
      const position = (index / total) * perimeter;

      let x = 0, y = 0;
      if (position < width) {
        x = position - 16;
        y = -24;
      } else if (position < width + height) {
        x = width - 8;
        y = position - width - 16;
      } else if (position < 2 * width + height) {
        x = width - (position - width - height) - 16;
        y = height - 8;
      } else {
        x = -24;
        y = height - (position - 2 * width - height) - 16;
      }
      return { 'left': `${x}px`, 'top': `${y}px` };
    }
  }

  getDisplayName(persona: PersonaTavoloDTO): string {
    if (persona.accompagnatore && persona.invitatorePrincipale) {
      return `${persona.nome} ${persona.cognome} (${persona.invitatorePrincipale})`;
    }
    return `${persona.nome} ${persona.cognome}`;
  }
}
