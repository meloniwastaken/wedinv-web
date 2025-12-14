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
  features = [
    {
      icon: 'bi-envelope-heart',
      title: 'Inviti Digitali',
      description: 'Crea e invia inviti personalizzati ai tuoi ospiti con un semplice link. Ogni invitato avrà la sua pagina dedicata.'
    },
    {
      icon: 'bi-people',
      title: 'Gestione Invitati',
      description: 'Tieni traccia delle conferme, delle intolleranze alimentari e degli accompagnatori in un unico posto.'
    },
    {
      icon: 'bi-gift',
      title: 'Lista Nozze',
      description: 'Crea la tua lista nozze digitale. Gli invitati potranno prenotare i regali evitando doppioni.'
    },
    {
      icon: 'bi-palette',
      title: 'Temi Personalizzabili',
      description: 'Scegli tra diversi temi eleganti per personalizzare l\'aspetto dei tuoi inviti digitali.'
    },
    {
      icon: 'bi-credit-card',
      title: 'Contributo IBAN',
      description: 'Permetti agli invitati di contribuire con un regalo in denaro tramite bonifico bancario.'
    },
    {
      icon: 'bi-graph-up',
      title: 'Dashboard Completa',
      description: 'Visualizza statistiche in tempo reale: conferme, rifiuti, accompagnatori e molto altro.'
    }
  ];
}
