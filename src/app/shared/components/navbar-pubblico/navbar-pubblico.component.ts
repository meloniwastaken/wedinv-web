import { Component, computed, HostListener, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services';

@Component({
  selector: 'app-navbar-pubblico',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar-pubblico.component.html',
  styleUrl: './navbar-pubblico.component.css'
})
export class NavbarPubblicoComponent {
  private themeService = inject(ThemeService);

  @Input() invitatoId: string = '';
  @Input() nomeInvitato: string = '';
  @Input() showListaNozze: boolean = false;
  @Input() showIban: boolean = false;
  @Input() nomeSezioneIban: string = 'IBAN';
  @Input() iconaSezioneIban: string = 'bi-credit-card';

  isMenuOpen = false;

  isDarkTheme = computed(() => this.themeService.currentTheme().id.endsWith('-dark'));

  toggleLightDark(): void {
    const currentId = this.themeService.currentTheme().id;
    let newId: string;

    if (currentId.endsWith('-dark')) {
      newId = currentId.replace('-dark', '');
    } else {
      newId = currentId + '-dark';
    }

    const targetTheme = this.themeService.getThemeById(newId);
    if (targetTheme) {
      this.themeService.setThemePublic(newId);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
