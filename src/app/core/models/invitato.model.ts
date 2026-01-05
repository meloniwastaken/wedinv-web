import { InvitatoEtichettaDTO } from './etichetta.model';

export interface AccompagnatoreDTO {
  id?: string;
  invitato?: string;
  nome: string;
  cognome: string;
  dataCreazione?: string;
  dataModifica?: string;
}

export interface MembroGruppoFamiliareDTO {
  id: string;
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  capogruppo: boolean;
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
  etichette?: InvitatoEtichettaDTO[];
  // Gruppo familiare
  gruppoFamiliare?: string | null;
  capogruppo?: boolean | null;
  membriFamiglia?: MembroGruppoFamiliareDTO[];
  nomeCapogruppo?: string | null;
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
  // Gruppo familiare
  gruppoFamiliare?: string | null;
  capogruppo?: boolean | null;
  nomeCapogruppo?: string | null;
  numMembriGruppo?: number | null;
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
  etichette?: string[];
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
  etichette?: string[];
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

// Gruppo Familiare
export interface GruppoFamiliareDTO {
  id: string;
  matrimonio: string;
  capogruppo: MembroGruppoFamiliareDTO;
  membri: MembroGruppoFamiliareDTO[];
  totalePersone: number;
}

export interface CreaGruppoFamiliareRequest {
  capogruppoId: string;
  membriIds: string[];
}

export interface AggiornaGruppoFamiliareRequest {
  capogruppoId: string;
  membriIds: string[];
}
