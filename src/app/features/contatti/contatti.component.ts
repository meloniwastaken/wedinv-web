import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-contatti',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contatti.component.html',
  styleUrl: './contatti.component.css'
})
export class ContattiComponent {
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;
  // Dati aziendali (placeholder - da sostituire con i dati reali)
  azienda = {
    nome: 'WedInv S.r.l.',
    indirizzo: '-',
    citta: '-',
    cap: '-',
    paese: 'Italia',
    email: 'info@wedinv.it',
    emailSupporto: 'supporto@wedinv.it',
    piva: '-',
    social: {
      instagram: 'https://instagram.com/wedinv',
      facebook: 'https://facebook.com/wedinv',
      linkedin: 'https://linkedin.com/company/wedinv'
    }
  };
}
