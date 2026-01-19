import { Component, Input, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DigitState {
  displayTop: string;      // Valore div statico superiore
  displayBottom: string;   // Valore div statico inferiore
  flapTop: string;         // Valore flap superiore
  flapBottom: string;      // Valore flap inferiore
  flapTopVisible: boolean;      // Flap top visibile?
  flapBottomVisible: boolean;   // Flap bottom visibile?
  flapTopAnimating: boolean;    // Flap top sta animando?
  flapBottomAnimating: boolean; // Flap bottom sta animando?
}

@Component({
  selector: 'app-flip-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flip-countdown.component.html',
  styleUrl: './flip-countdown.component.css'
})
export class FlipCountdownComponent implements OnInit, OnDestroy {
  @Input() targetDate: Date | string | null = null;
  @Input() showLabels: boolean = true;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly FLIP_DURATION = 300; // ms per ogni flap

  // Stato per ogni unità
  days = signal<DigitState[]>([]);
  hours = signal<DigitState[]>([]);
  minutes = signal<DigitState[]>([]);
  seconds = signal<DigitState[]>([]);

  // Computed per verificare se il countdown è scaduto
  isExpired = computed(() => {
    const target = this.getTargetDate();
    if (!target) return true;
    return new Date().getTime() >= target.getTime();
  });

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private getTargetDate(): Date | null {
    if (!this.targetDate) return null;
    if (this.targetDate instanceof Date) return this.targetDate;
    const parsed = new Date(this.targetDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private updateCountdown(): void {
    const target = this.getTargetDate();
    if (!target) {
      this.setDigits(this.days, '00');
      this.setDigits(this.hours, '00');
      this.setDigits(this.minutes, '00');
      this.setDigits(this.seconds, '00');
      return;
    }

    const now = new Date().getTime();
    const distance = target.getTime() - now;

    if (distance <= 0) {
      this.setDigits(this.days, '00');
      this.setDigits(this.hours, '00');
      this.setDigits(this.minutes, '00');
      this.setDigits(this.seconds, '00');
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    const daysStr = d.toString().padStart(2, '0');
    const hoursStr = h.toString().padStart(2, '0');
    const minutesStr = m.toString().padStart(2, '0');
    const secondsStr = s.toString().padStart(2, '0');

    this.setDigits(this.days, daysStr);
    this.setDigits(this.hours, hoursStr);
    this.setDigits(this.minutes, minutesStr);
    this.setDigits(this.seconds, secondsStr);
  }

  private createInitialState(value: string): DigitState {
    return {
      displayTop: value,
      displayBottom: value,
      flapTop: value,
      flapBottom: value,
      flapTopVisible: false,
      flapBottomVisible: false,
      flapTopAnimating: false,
      flapBottomAnimating: false
    };
  }

  private setDigits(signalRef: ReturnType<typeof signal<DigitState[]>>, value: string): void {
    const currentDigits = signalRef();
    const newDigits: DigitState[] = [];

    for (let i = 0; i < value.length; i++) {
      const newChar = value[i];
      const oldState = currentDigits[i];
      const oldChar = oldState?.displayTop ?? newChar;

      if (oldChar !== newChar) {
        // CAMBIO CIFRA - Inizia sequenza animazione

        // t=0: flapTop appare col valore VECCHIO, displayTop diventa NUOVO
        newDigits.push({
          displayTop: newChar,        // Aggiorna subito (nascosto sotto flapTop)
          displayBottom: oldChar,     // Resta vecchio per ora
          flapTop: oldChar,           // Mostra valore vecchio
          flapBottom: oldChar,        // Non ancora usato
          flapTopVisible: true,       // APPARE
          flapBottomVisible: false,
          flapTopAnimating: true,     // Inizia animazione
          flapBottomAnimating: false
        });

        // t=300ms: flapTop scompare, flapBottom appare col NUOVO, displayBottom diventa NUOVO
        setTimeout(() => {
          const updated = signalRef().map((d, idx) => {
            if (idx !== i) return d;
            return {
              ...d,
              displayBottom: newChar,     // Aggiorna (nascosto sotto flapBottom)
              flapTop: newChar,
              flapBottom: newChar,        // Mostra valore nuovo
              flapTopVisible: false,      // SCOMPARE
              flapBottomVisible: true,    // APPARE
              flapTopAnimating: false,
              flapBottomAnimating: true   // Inizia animazione
            };
          });
          signalRef.set(updated);
        }, this.FLIP_DURATION);

        // t=600ms: flapBottom scompare, tutto torna normale
        setTimeout(() => {
          const updated = signalRef().map((d, idx) => {
            if (idx !== i) return d;
            return {
              displayTop: newChar,
              displayBottom: newChar,
              flapTop: newChar,
              flapBottom: newChar,
              flapTopVisible: false,      // SCOMPARE
              flapBottomVisible: false,
              flapTopAnimating: false,
              flapBottomAnimating: false
            };
          });
          signalRef.set(updated);
        }, this.FLIP_DURATION * 2);

      } else {
        // Nessun cambio - mantieni stato o inizializza
        if (oldState) {
          newDigits.push(oldState);
        } else {
          newDigits.push(this.createInitialState(newChar));
        }
      }
    }

    signalRef.set(newDigits);
  }
}
