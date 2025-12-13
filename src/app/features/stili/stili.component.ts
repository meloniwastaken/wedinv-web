import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../core/services';

export interface ThemePair {
  light: Theme;
  dark: Theme;
}

@Component({
  selector: 'app-stili',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stili.component.html',
  styleUrl: './stili.component.css'
})
export class StiliComponent {
  private themeService = inject(ThemeService);

  themes = this.themeService.themes;
  currentTheme = computed(() => this.themeService.currentTheme());

  // Crea coppie light/dark per ogni tema
  themePairs: ThemePair[] = this.createThemePairs();

  private createThemePairs(): ThemePair[] {
    const pairs: ThemePair[] = [];
    const lightThemes = this.themes.filter(t => !t.id.endsWith('-dark'));

    for (const light of lightThemes) {
      const darkId = light.id + '-dark';
      const dark = this.themes.find(t => t.id === darkId);
      if (dark) {
        pairs.push({ light, dark });
      }
    }

    return pairs;
  }

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme.id);
  }

  isSelected(theme: Theme): boolean {
    return this.currentTheme().id === theme.id;
  }

  isSelectedPair(pair: ThemePair): boolean {
    const currentId = this.currentTheme().id;
    return currentId === pair.light.id || currentId === pair.dark.id;
  }
}
