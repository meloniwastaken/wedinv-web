import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Prima riga - 4 card
  featuresRow1 = [
    {
      icon: 'bi-envelope-heart',
      title: 'Inviti Digitali',
      description: 'Invia inviti via email, SMS o WhatsApp. Ogni invitato riceve un link personalizzato per confermare la presenza.'
    },
    {
      icon: 'bi-people',
      title: 'Gestione Invitati',
      description: 'Importa la lista da Excel, gestisci conferme, accompagnatori, intolleranze alimentari e menu preferiti.'
    },
    {
      icon: 'bi-grid-3x3',
      title: 'Gestione Tavoli',
      description: 'Organizza la disposizione dei tavoli con drag & drop. Suggerimenti automatici basati sulle etichette degli invitati.'
    },
    {
      icon: 'bi-gift',
      title: 'Lista Nozze',
      description: 'Crea la tua lista nozze digitale. Gli invitati possono prenotare i regali ed evitare doppioni.'
    }
  ];

  // Seconda riga - 3 card
  featuresRow2 = [
    {
      icon: 'bi-palette',
      title: 'Temi Personalizzabili',
      description: 'Personalizza colori, font e stile della pagina pubblica del tuo matrimonio per renderla unica.'
    },
    {
      icon: 'bi-credit-card',
      title: 'Contributo IBAN',
      description: 'Permetti agli invitati di contribuire con un regalo in denaro. L\'IBAN viene mostrato nella pagina pubblica.'
    },
    {
      icon: 'bi-speedometer2',
      title: 'Dashboard Completa',
      description: 'Monitora in tempo reale: conferme, rifiuti, menu scelti, statistiche e countdown al grande giorno.'
    }
  ];
}
