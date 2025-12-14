export interface ElementoListaNozzeDTO {
  id: string;
  matrimonio: string;
  nome: string;
  descrizione: string | null;
  link: string | null;
  invitatoPrenotante: string | null;
  nomePrenotante: string | null;
  dataPrenotazione: string | null;
  dataCreazione: string | null;
  dataModifica: string | null;
}

export interface ListaElementiNozzeResponse {
  hasMatrimonio: boolean;
  elementi: ElementoListaNozzeDTO[];
}

export interface CreaElementoListaNozzeRequest {
  nome: string;
  descrizione?: string | null;
  link?: string | null;
}

export interface AggiornaElementoListaNozzeRequest {
  nome: string;
  descrizione?: string | null;
  link?: string | null;
}

// Modelli per la vista pubblica
export interface ElementoListaNozzePubblicoDTO {
  id: string;
  nome: string;
  descrizione: string | null;
  link: string | null;
  stato: 'DISPONIBILE' | 'PRENOTATO_DA_ME' | 'PRENOTATO_DA_ALTRI';
  disponibile: boolean;
  prenotatoDaMe: boolean;
  prenotatoDaAltri: boolean;
}

export interface ListaNozzePubblicoResponse {
  elementi: ElementoListaNozzePubblicoDTO[];
  nomeSposoA: string;
  nomeSposoB: string;
  iban: string | null;
  linkListaNozze: string | null;
}

export interface PrenotaElementiListaNozzeRequest {
  elementiPrenotati: string[];
}
