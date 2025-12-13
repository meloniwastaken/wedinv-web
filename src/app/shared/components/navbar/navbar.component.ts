import { Component, computed, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, ThemeService } from '../../../core/services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private themeService = inject(ThemeService);

  isMenuOpen = false;
  isDropdownOpen = false;

  user = computed(() => this.authService.user());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  userName = computed(() => {
    const u = this.user();
    return u ? `${u.nome} ${u.cognome}` : '';
  });

  isDarkTheme = computed(() => this.themeService.currentTheme().id.endsWith('-dark'));

  constructor(private authService: AuthService) {}

  toggleLightDark(): void {
    const currentId = this.themeService.currentTheme().id;
    let newId: string;

    if (currentId.endsWith('-dark')) {
      // Switch to light
      newId = currentId.replace('-dark', '');
    } else {
      // Switch to dark
      newId = currentId + '-dark';
    }

    // Check if the target theme exists
    const targetTheme = this.themeService.getThemeById(newId);
    if (targetTheme) {
      this.themeService.setTheme(newId);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.isDropdownOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.closeDropdown();
    this.authService.logout();
  }
}
