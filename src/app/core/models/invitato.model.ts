export interface InvitatoDTO {
  id: string;
  matrimonio: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string | null;
  numeroPlusConsentiti: number | null;
  plusConfermati: number | null;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  dataInvioEmail: string | null;
  dataConferma: string | null;
  note: string | null;
  dataCreazione: string;
  dataModifica: string;
}

export interface InvitatoRiepilogoDTO {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  numeroPlusConsentiti: number | null;
  plusConfermati: number | null;
}

export interface ListaInvitatiResponse {
  invitati: InvitatoRiepilogoDTO[];
  totaleInvitati: number;
  totaleConfermati: number;
  totaleRifiutati: number;
}

export interface CreaInvitatoRequest {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string | null;
  numeroPlusConsentiti?: number | null;
  note?: string | null;
}

export interface AggiornaInvitatoRequest {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string | null;
  numeroPlusConsentiti?: number | null;
  statoInvito?: number | null;
  plusConfermati?: number | null;
  note?: string | null;
}

export interface InviaInvitiRequest {
  invitatoIds?: string[];
  tuttiNonInviati?: boolean;
}

export interface InvioInvitiResponse {
  totaleInviati: number;
  totaleFalliti: number;
  errori: string[];
}

export enum StatoInvito {
  DA_INVIARE = 1,
  INVIATO = 2,
  CONFERMATO = 3,
  RIFIUTATO = 4
}
