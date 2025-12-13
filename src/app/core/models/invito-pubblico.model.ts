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
  stileCodice: string | null;
}

export interface ConfermaInvitoRequest {
  confermato: boolean;
  plusConfermati?: number | null;
}
