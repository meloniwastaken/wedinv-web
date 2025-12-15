import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly BASE_TITLE = 'WedInv';
  private titleService = inject(Title);

  /**
   * Imposta il titolo base "WedInv"
   */
  setBaseTitle(): void {
    this.titleService.setTitle(this.BASE_TITLE);
  }

  /**
   * Imposta il titolo con i nomi degli sposi: "WedInv - NomeSposoA & NomeSposoB"
   */
  setTitleWithSposi(nomeSposoA: string, nomeSposoB: string): void {
    this.titleService.setTitle(`${this.BASE_TITLE} - ${nomeSposoA} & ${nomeSposoB}`);
  }

  /**
   * Imposta un titolo personalizzato: "WedInv - [suffix]"
   */
  setTitle(suffix?: string): void {
    if (suffix) {
      this.titleService.setTitle(`${this.BASE_TITLE} - ${suffix}`);
    } else {
      this.setBaseTitle();
    }
  }
}
