import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    danger: string;
    warning: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private http = inject(HttpClient);

  private readonly COOKIE_NAME = 'wedinv_theme';
  private readonly DEFAULT_THEME_ID = 'classic-gold';
  private readonly apiUrl = `${environment.apiUrl}/matrimonio`;

  // Default theme defined inline to avoid initialization order issues
  private readonly DEFAULT_THEME: Theme = {
    id: 'classic-gold',
    name: 'Oro Classico',
    description: 'Eleganza senza tempo con oro e avorio',
    colors: {
      primary: '#b8860b',
      primaryLight: '#daa520',
      primaryDark: '#8b6914',
      secondary: '#f5f5dc',
      secondaryLight: '#fffef0',
      accent: '#d4af37',
      background: '#fffef7',
      backgroundAlt: '#faf8f0',
      text: '#2c2c2c',
      textMuted: '#666666',
      border: '#e8e4d9',
      success: '#5c8a4d',
      danger: '#c45c5c',
      warning: '#d4a017'
    }
  };

  private currentThemeSignal = signal<Theme>(this.DEFAULT_THEME);
  readonly currentTheme = this.currentThemeSignal.asReadonly();

  readonly themes: Theme[] = [
    {
      id: 'classic-gold',
      name: 'Oro Classico',
      description: 'Eleganza senza tempo con oro e avorio',
      colors: {
        primary: '#b8860b',
        primaryLight: '#daa520',
        primaryDark: '#8b6914',
        secondary: '#f5f5dc',
        secondaryLight: '#fffef0',
        accent: '#d4af37',
        background: '#fffef7',
        backgroundAlt: '#faf8f0',
        text: '#2c2c2c',
        textMuted: '#666666',
        border: '#e8e4d9',
        success: '#5c8a4d',
        danger: '#c45c5c',
        warning: '#d4a017'
      }
    },
    {
      id: 'romantic-rose',
      name: 'Rosa Romantico',
      description: 'Delicato e romantico con sfumature rosa',
      colors: {
        primary: '#d4a5a5',
        primaryLight: '#e8c4c4',
        primaryDark: '#b87777',
        secondary: '#fff5f5',
        secondaryLight: '#fffafa',
        accent: '#c98b8b',
        background: '#fffbfb',
        backgroundAlt: '#fdf5f5',
        text: '#4a3535',
        textMuted: '#7a6565',
        border: '#f0e0e0',
        success: '#7dad7d',
        danger: '#c45c5c',
        warning: '#d4a574'
      }
    },
    {
      id: 'sage-green',
      name: 'Verde Salvia',
      description: 'Naturale e rilassante con toni verdi',
      colors: {
        primary: '#87a08b',
        primaryLight: '#a8c4ac',
        primaryDark: '#6b846f',
        secondary: '#f5f8f5',
        secondaryLight: '#fafcfa',
        accent: '#9bb59f',
        background: '#fafcfa',
        backgroundAlt: '#f0f5f0',
        text: '#2d3830',
        textMuted: '#5a6b5c',
        border: '#d4e0d6',
        success: '#6b9b6b',
        danger: '#b86b6b',
        warning: '#c4a86b'
      }
    },
    {
      id: 'dusty-blue',
      name: 'Blu Polvere',
      description: 'Sofisticato e sereno con blu delicato',
      colors: {
        primary: '#7a9bb8',
        primaryLight: '#a4bdd4',
        primaryDark: '#5a7a94',
        secondary: '#f5f8fb',
        secondaryLight: '#fafcfe',
        accent: '#8fafc8',
        background: '#fafcfe',
        backgroundAlt: '#f0f5fa',
        text: '#2c3540',
        textMuted: '#5a6a7a',
        border: '#d4e0eb',
        success: '#6b9b7a',
        danger: '#b87a7a',
        warning: '#c4a87a'
      }
    },
    {
      id: 'lavender-dream',
      name: 'Sogno Lavanda',
      description: 'Delicato e sognante con viola pastello',
      colors: {
        primary: '#9b8bb8',
        primaryLight: '#b8a8d0',
        primaryDark: '#7a6b94',
        secondary: '#f8f5fb',
        secondaryLight: '#fcfafe',
        accent: '#a898c0',
        background: '#fcfaff',
        backgroundAlt: '#f5f0fa',
        text: '#352c40',
        textMuted: '#6a5a7a',
        border: '#e0d4eb',
        success: '#7a9b7a',
        danger: '#b87a8b',
        warning: '#c4a87a'
      }
    },
    {
      id: 'terracotta',
      name: 'Terracotta',
      description: 'Caldo e rustico con toni terra',
      colors: {
        primary: '#c4785a',
        primaryLight: '#d9a08a',
        primaryDark: '#a45c40',
        secondary: '#fdf8f5',
        secondaryLight: '#fffcfa',
        accent: '#d4906b',
        background: '#fffaf7',
        backgroundAlt: '#faf5f0',
        text: '#3d2c25',
        textMuted: '#7a5c50',
        border: '#ebe0d8',
        success: '#7a9b6b',
        danger: '#c45c5c',
        warning: '#d4a05a'
      }
    },
    {
      id: 'navy-elegance',
      name: 'Blu Navy',
      description: 'Classico e raffinato con blu scuro',
      colors: {
        primary: '#2c3e50',
        primaryLight: '#4a6580',
        primaryDark: '#1a252f',
        secondary: '#f5f7fa',
        secondaryLight: '#fafbfc',
        accent: '#34495e',
        background: '#fafbfc',
        backgroundAlt: '#f0f3f7',
        text: '#1a1a2e',
        textMuted: '#5a6070',
        border: '#d4dae5',
        success: '#5a8a6b',
        danger: '#c45c5c',
        warning: '#d4a05a'
      }
    },
    {
      id: 'burgundy',
      name: 'Borgogna',
      description: 'Elegante e passionale con rosso intenso',
      colors: {
        primary: '#722f37',
        primaryLight: '#9b4a54',
        primaryDark: '#4a1f24',
        secondary: '#fdf5f6',
        secondaryLight: '#fffafa',
        accent: '#8b3a44',
        background: '#fffafa',
        backgroundAlt: '#faf5f5',
        text: '#2c1a1c',
        textMuted: '#6a4a50',
        border: '#e8d8da',
        success: '#5a8a5a',
        danger: '#a03c3c',
        warning: '#c4905a'
      }
    },
    {
      id: 'champagne',
      name: 'Champagne',
      description: 'Lussuoso e festivo con beige dorato',
      colors: {
        primary: '#d4b896',
        primaryLight: '#e8d4bc',
        primaryDark: '#b89b78',
        secondary: '#fcfaf5',
        secondaryLight: '#fffefa',
        accent: '#c8a882',
        background: '#fffdf8',
        backgroundAlt: '#faf8f2',
        text: '#3d3528',
        textMuted: '#7a6b58',
        border: '#ebe4d8',
        success: '#7a9b6b',
        danger: '#b87a6b',
        warning: '#c4a05a'
      }
    },
    {
      id: 'midnight-garden',
      name: 'Giardino di Mezzanotte',
      description: 'Misterioso e romantico con verde scuro',
      colors: {
        primary: '#2d4a3e',
        primaryLight: '#4a7060',
        primaryDark: '#1a2d25',
        secondary: '#f5f8f6',
        secondaryLight: '#fafcfb',
        accent: '#3d5a4e',
        background: '#fafcfb',
        backgroundAlt: '#f0f5f2',
        text: '#1a2820',
        textMuted: '#4a6050',
        border: '#d4e0d8',
        success: '#4a8a5a',
        danger: '#a05050',
        warning: '#b8905a'
      }
    },
    {
      id: 'peach-blossom',
      name: 'Fiore di Pesco',
      description: 'Fresco e gioioso con pesca e corallo',
      colors: {
        primary: '#e8a87c',
        primaryLight: '#f4c4a8',
        primaryDark: '#c88a5c',
        secondary: '#fff8f5',
        secondaryLight: '#fffcfa',
        accent: '#f0b890',
        background: '#fffbf8',
        backgroundAlt: '#faf6f2',
        text: '#402820',
        textMuted: '#7a5848',
        border: '#f0e0d8',
        success: '#7aa07a',
        danger: '#c86060',
        warning: '#d4a060'
      }
    }
  ];

  constructor() {
    this.loadThemeFromCookie();
  }

  /**
   * Inizializza il tema per utente autenticato:
   * - Se stileCodice presente dall'API, sovrascrive sempre il cookie
   * - Altrimenti usa cookie esistente o default
   */
  initializeTheme(stileCodiceFromMatrimonio: string | null): void {
    if (stileCodiceFromMatrimonio) {
      // Stile dall'API: sovrascrive sempre
      const theme = this.getThemeById(stileCodiceFromMatrimonio) || this.DEFAULT_THEME;
      this.currentThemeSignal.set(theme);
      this.applyTheme(theme);
      this.setCookie(this.COOKIE_NAME, theme.id, 365);
    } else {
      // Nessuno stile dall'API: usa cookie o default
      const savedThemeId = this.getCookie(this.COOKIE_NAME);
      const theme = savedThemeId
        ? (this.getThemeById(savedThemeId) || this.DEFAULT_THEME)
        : this.DEFAULT_THEME;
      this.currentThemeSignal.set(theme);
      this.applyTheme(theme);
    }
  }

  private loadThemeFromCookie(): void {
    const savedThemeId = this.getCookie(this.COOKIE_NAME);
    let theme: Theme | undefined;

    if (savedThemeId) {
      theme = this.getThemeById(savedThemeId);
    }

    // Use default theme if no cookie or theme not found
    if (!theme) {
      theme = this.DEFAULT_THEME;
    }

    this.currentThemeSignal.set(theme);
    this.applyTheme(theme);
  }

  getThemeById(id: string): Theme | undefined {
    return this.themes.find(t => t.id === id);
  }

  /**
   * Applica il tema per pagine pubbliche (es. invito):
   * - Se stileCodice presente, usa quello e sovrascrive il cookie
   * - Altrimenti usa default
   */
  applyThemeForPublicPage(stileCodice: string | null): void {
    const theme = stileCodice
      ? (this.getThemeById(stileCodice) || this.DEFAULT_THEME)
      : this.DEFAULT_THEME;
    this.currentThemeSignal.set(theme);
    this.applyTheme(theme);
    if (stileCodice) {
      this.setCookie(this.COOKIE_NAME, theme.id, 365);
    }
  }

  /**
   * Imposta il tema:
   * - Applica visivamente
   * - Salva nel cookie
   * - Chiama API per aggiornare matrimonio (se esiste, altrimenti ignora errore)
   */
  setTheme(themeId: string): void {
    const theme = this.getThemeById(themeId);
    if (theme) {
      this.currentThemeSignal.set(theme);
      this.applyTheme(theme);
      this.setCookie(this.COOKIE_NAME, themeId, 365);

      // Chiama API per aggiornare lo stile sul matrimonio (se esiste)
      this.http.put<void>(`${this.apiUrl}/stile`, { stileCodice: themeId }).subscribe({
        next: () => {
          // Stile aggiornato sul server
        },
        error: () => {
          // Ignora errore (matrimonio potrebbe non esistere)
        }
      });
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
    root.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-secondary-light', theme.colors.secondaryLight);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-alt', theme.colors.backgroundAlt);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-danger', theme.colors.danger);
    root.style.setProperty('--color-warning', theme.colors.warning);
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  }
}
