import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ErrorModalComponent } from './shared/components/error-modal/error-modal.component';
import { AuthService, ThemeService } from './core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ErrorModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService); // Initialize theme from cookie

  isAuthenticated = computed(() => this.authService.isAuthenticated());

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  showNavbar = computed(() => {
    const url = this.currentUrl();
    const isPublicRoute = url.startsWith('/login') ||
                          url.startsWith('/registrazione') ||
                          url.startsWith('/invito/');
    // Con il modello freemium, mostra la navbar per tutti gli utenti autenticati (FREE e Premium)
    return this.isAuthenticated() && !isPublicRoute;
  });
}
