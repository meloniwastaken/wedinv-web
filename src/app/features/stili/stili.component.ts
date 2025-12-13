import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../core/services';

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

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme.id);
  }

  isSelected(theme: Theme): boolean {
    return this.currentTheme().id === theme.id;
  }
}
