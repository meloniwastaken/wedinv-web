export interface AccompagnatoreDTO {
  id?: string;
  invitato?: string;
  nome: string;
  cognome: string;
  dataCreazione?: string;
  dataModifica?: string;
}

export interface InvitatoDTO {
  id: string;
  matrimonio: string;
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  numeroPlusConsentiti: number | null;
  plusConfermati: number | null;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  dataInvioEmail: string | null;
  dataConferma: string | null;
  note: string | null;
  intolleranzeAlimentari: string | null;
  dataCreazione: string;
  dataModifica: string;
  accompagnatori?: AccompagnatoreDTO[];
}

export interface InvitatoRiepilogoDTO {
  id: string;
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  numeroPlusConsentiti: number | null;
  plusConfermati: number | null;
  intolleranzeAlimentari: string | null;
}

export interface ListaInvitatiResponse {
  hasMatrimonio: boolean;
  invitati: InvitatoRiepilogoDTO[];
  totaleInvitati: number;
  totaleConfermati: number;
  totaleRifiutati: number;
}

export interface CreaInvitatoRequest {
  nome: string;
  cognome: string;
  email?: string | null;
  telefono?: string | null;
  numeroPlusConsentiti?: number | null;
  note?: string | null;
}

export interface AggiornaInvitatoRequest {
  nome: string;
  cognome: string;
  email?: string | null;
  telefono?: string | null;
  numeroPlusConsentiti?: number | null;
  statoInvito?: number | null;
  plusConfermati?: number | null;
  note?: string | null;
  intolleranzeAlimentari?: string | null;
  accompagnatori?: AccompagnatoreDTO[];
}

export enum CanaleInvio {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  ENTRAMBI = 'ENTRAMBI'
}

export interface InviaInvitiRequest {
  invitatoIds?: string[];
  tuttiNonInviati?: boolean;
  canale: CanaleInvio;
}

export interface InvioInvitiResponse {
  totaleInviati: number;
  totaleFalliti: number;
  errori: string[];
}

export interface ImportaInvitatiResponse {
  totaleImportati: number;
  totaleFalliti: number;
  errori: string[];
}

export enum StatoInvito {
  DA_INVIARE = 1,
  INVIATO = 2,
  CONFERMATO = 3,
  RIFIUTATO = 4
}
