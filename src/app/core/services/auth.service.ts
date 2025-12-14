import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegistrazioneUtenteRequest,
  UtenteSession
} from '../models';
import { IdResponse } from '../models';

const TOKEN_KEY = 'wedinv_token';
const USER_KEY = 'wedinv_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/utente`;

  private userSignal = signal<UtenteSession | null>(this.loadUserFromStorage());

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isActive = computed(() => this.userSignal()?.attivo ?? false);
  readonly token = computed(() => this.userSignal()?.token || null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private loadUserFromStorage(): UtenteSession | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        return { ...user, token };
      } catch {
        return null;
      }
    }
    return null;
  }

  registrazione(request: RegistrazioneUtenteRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(`${this.apiUrl}/registrazione`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        const user: UtenteSession = {
          id: response.id,
          email: response.email,
          nome: response.nome,
          cognome: response.cognome,
          token: response.token,
          attivo: response.attivo
        };

        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.id,
          email: response.email,
          nome: response.nome,
          cognome: response.cognome,
          attivo: response.attivo
        }));

        this.userSignal.set(user);
      })
    );
  }

  updateUserActiveStatus(attivo: boolean): void {
    const currentUser = this.userSignal();
    if (currentUser) {
      const updatedUser = { ...currentUser, attivo };
      this.userSignal.set(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        nome: updatedUser.nome,
        cognome: updatedUser.cognome,
        attivo: updatedUser.attivo
      }));
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  verificaEmail(token: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/verifica-email/${token}`);
  }
}
