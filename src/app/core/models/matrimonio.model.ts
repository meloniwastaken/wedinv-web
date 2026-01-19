export interface MatrimonioDTO {
  id: string;
  utente: string;
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
  dataDeadlineConferma: string | null;
  contattoRiferimento: string | null;
  beneficiarioBonifico: string | null;
  iban: string | null;
  linkListaNozze: string | null;
  note: string | null;
  messaggioInvito: string | null;
  messaggioInvitoFamiglia: string | null;
  messaggioIban: string | null;
  dataCreazione: string;
  dataModifica: string;
  stileCodice: string | null;
  hasFotoInvito?: boolean | null;
  fotoInvitoBase64?: string | null;
}

export interface CreaMatrimonioRequest {
  nomeSposoA: string;
  cognomeSposoA: string;
  nomeSposoB: string;
  cognomeSposoB: string;
  dataCerimonia: string;
  oraCerimonia?: string | null;
  luogoCerimonia?: string | null;
  indirizzoCerimonia?: string | null;
  cittaCerimonia?: string | null;
  linkMapsCerimonia?: string | null;
  dataRicevimento: string;
  oraRicevimento?: string | null;
  luogoRicevimento?: string | null;
  indirizzoRicevimento?: string | null;
  cittaRicevimento?: string | null;
  linkMapsRicevimento?: string | null;
  dataDeadlineConferma?: string | null;
  contattoRiferimento?: string | null;
  beneficiarioBonifico?: string | null;
  iban?: string | null;
  linkListaNozze?: string | null;
  note?: string | null;
  messaggioInvito?: string | null;
  messaggioInvitoFamiglia?: string | null;
  messaggioIban?: string | null;
  stileCodice?: string | null;
  fotoInvitoBase64?: string | null;
}

export interface AggiornaMatrimonioRequest extends CreaMatrimonioRequest {}

export interface AggiornaStileRequest {
  stileCodice: string;
}
