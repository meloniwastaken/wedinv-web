export interface EtichettaDTO {
  id: string;
  matrimonio: string;
  nome: string;
  priorita: number;
  dataCreazione: string;
  colore?: string;
}

export interface EtichettaPersonaDTO {
  id: string;
  nome: string;
  colore?: string;
}

export interface InvitatoEtichettaDTO {
  id?: string;
  etichettaId: string;
  etichettaNome?: string;
  etichettaPriorita?: number;
  priorita: number;
}

export interface CreaEtichettaRequest {
  nome: string;
  priorita?: number;
}

export interface AggiornaEtichettaRequest {
  nome: string;
  priorita?: number;
}
