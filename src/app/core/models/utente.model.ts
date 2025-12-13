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
}

export interface UtenteSession {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  token: string;
}
