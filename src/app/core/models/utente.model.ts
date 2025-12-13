export interface RegistrazioneUtenteRequest {
  email: string;
  password: string;
  confermaPassword: string;
  nome: string;
  cognome: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  nome: string;
  cognome: string;
  attivo: boolean;
}

export interface UtenteSession {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  token: string;
  attivo: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}
