import { Routes } from '@angular/router';
import { authGuard, guestGuard, paymentGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Home page (landing per guest)
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [guestGuard],
    pathMatch: 'full'
  },

  // Route pubbliche (guest)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'registrazione',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'verifica-email/:token',
    loadComponent: () => import('./features/auth/verifica-email/verifica-email.component').then(m => m.VerificaEmailComponent)
  },
  {
    path: 'password-dimenticata',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // Route pubbliche per invito
  {
    path: 'invito/:id',
    loadComponent: () => import('./features/public/invito/invito-pubblico.component').then(m => m.InvitoPubblicoComponent)
  },
  {
    path: 'invito/:id/matrimonio',
    loadComponent: () => import('./features/public/matrimonio-pubblico/matrimonio-pubblico.component').then(m => m.MatrimonioPubblicoComponent)
  },
  {
    path: 'invito/:id/lista-nozze',
    loadComponent: () => import('./features/public/lista-nozze-pubblico/lista-nozze-pubblico.component').then(m => m.ListaNozzePubblicoComponent)
  },
  {
    path: 'invito/:id/iban',
    loadComponent: () => import('./features/public/iban-pubblico/iban-pubblico.component').then(m => m.IbanPubblicoComponent)
  },

  // Route pagamento (autenticato ma non attivo)
  {
    path: 'pagamento',
    loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [paymentGuard]
  },
  {
    path: 'pagamento/successo',
    loadComponent: () => import('./features/payment/payment-success.component').then(m => m.PaymentSuccessComponent),
    canActivate: [paymentGuard]
  },
  {
    path: 'pagamento/annullato',
    loadComponent: () => import('./features/payment/payment-cancel.component').then(m => m.PaymentCancelComponent),
    canActivate: [paymentGuard]
  },

  // Route protette (auth + attivo)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'matrimonio',
    loadComponent: () => import('./features/matrimonio/matrimonio.component').then(m => m.MatrimonioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'invitati',
    loadComponent: () => import('./features/invitati/lista/lista-invitati.component').then(m => m.ListaInvitatiComponent),
    canActivate: [authGuard]
  },
  {
    path: 'invitati/nuovo',
    loadComponent: () => import('./features/invitati/dettaglio/dettaglio-invitato.component').then(m => m.DettaglioInvitatoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'invitati/:id',
    loadComponent: () => import('./features/invitati/dettaglio/dettaglio-invitato.component').then(m => m.DettaglioInvitatoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stili',
    loadComponent: () => import('./features/stili/stili.component').then(m => m.StiliComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lista-nozze',
    loadComponent: () => import('./features/lista-nozze/lista-nozze.component').then(m => m.ListaNozzeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tavoli',
    loadComponent: () => import('./features/tavoli/tavoli.component').then(m => m.TavoliComponent),
    canActivate: [authGuard]
  },

  // 404
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
