import { AccompagnatoreDTO } from './invitato.model';

export interface MembroFamigliaPubblico {
  id: string;
  nome: string;
  cognome: string;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  capogruppo: boolean | null;
  intolleranzeAlimentari: string | null;
}

export interface InvitoPubblicoResponse {
  nomeInvitato: string;
  cognomeInvitato: string;
  nomeSposoA: string;
  cognomeSposoA: string;
  nomeSposoB: string;
  cognomeSposoB: string;
  dataCerimonia: string;
  oraCerimonia: string | null;
  luogoCerimonia: string | null;
  indirizzoCerimonia: string | null;
  cittaCerimonia: string | null;
  linkMapsCerimonia: string | null;
  embedMapsCerimonia: string | null;
  dataRicevimento: string;
  oraRicevimento: string | null;
  luogoRicevimento: string | null;
  indirizzoRicevimento: string | null;
  cittaRicevimento: string | null;
  linkMapsRicevimento: string | null;
  embedMapsRicevimento: string | null;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  numeroPlusConsentiti: number | null;
  plusConfermati: number | null;
  dataDeadlineConferma: string | null;
  contattoRiferimento: string | null;
  iban: string | null;
  linkListaNozze: string | null;
  note: string | null;
  messaggioInvito: string | null;
  messaggioInvitoFamiglia: string | null;
  messaggioIban: string | null;
  stileCodice: string | null;
  // Foto invito (base64)
  fotoInvitoBase64?: string | null;
  intolleranzeAlimentari: string | null;
  accompagnatori?: AccompagnatoreDTO[];
  // Gruppo familiare
  capogruppo?: boolean | null;
  membroFamiglia?: boolean | null;
  nomeGruppo?: string | null; // Es. "Fam. Rossi" - per il saluto nell'invito
  membriFamiglia?: MembroFamigliaPubblico[];
}

export interface ConfermaMembroFamiglia {
  id: string;
  confermato: boolean;
  intolleranzeAlimentari?: string | null;
}

export interface ConfermaInvitoRequest {
  confermato: boolean;
  plusConfermati?: number | null;
  intolleranzeAlimentari?: string | null;
  accompagnatori?: AccompagnatoreDTO[];
  confermeFamiglia?: ConfermaMembroFamiglia[];
}

// Intolleranze gruppo familiare
export interface IntolleranzaMembro {
  id: string;
  intolleranzeAlimentari: string | null;
}

export interface AggiornaIntolleranzeGruppoRequest {
  intolleranze: IntolleranzaMembro[];
}

export interface IntolleranzeMembroResponse {
  id: string;
  nome: string;
  cognome: string;
  intolleranzeAlimentari: string | null;
}

export interface IntolleranzeGruppoResponse {
  nomeGruppo: string | null;
  membri: IntolleranzeMembroResponse[];
}
