import { Component, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  isDropdownOpen = false;

  user = computed(() => this.authService.user());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  userName = computed(() => {
    const u = this.user();
    return u ? `${u.nome} ${u.cognome}` : '';
  });

  constructor(private authService: AuthService) {}

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
