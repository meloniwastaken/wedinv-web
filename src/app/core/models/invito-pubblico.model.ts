import { AccompagnatoreDTO } from './invitato.model';

export interface MembroFamigliaPubblico {
  id: string;
  nome: string;
  cognome: string;
  statoInvito: number | null;
  statoInvitoDescrizione: string | null;
  capogruppo: boolean | null;
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
  dataRicevimento: string;
  oraRicevimento: string | null;
  luogoRicevimento: string | null;
  indirizzoRicevimento: string | null;
  cittaRicevimento: string | null;
  linkMapsRicevimento: string | null;
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
  messaggioIban: string | null;
  stileCodice: string | null;
  intolleranzeAlimentari: string | null;
  accompagnatori?: AccompagnatoreDTO[];
  // Gruppo familiare
  capogruppo?: boolean | null;
  membroFamiglia?: boolean | null;
  membriFamiglia?: MembroFamigliaPubblico[];
}

export interface ConfermaMembroFamiglia {
  id: string;
  confermato: boolean;
}

export interface ConfermaInvitoRequest {
  confermato: boolean;
  plusConfermati?: number | null;
  intolleranzeAlimentari?: string | null;
  accompagnatori?: AccompagnatoreDTO[];
  confermeFamiglia?: ConfermaMembroFamiglia[];
}
