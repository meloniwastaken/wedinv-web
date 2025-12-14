export interface PersonaTavoloDTO {
  id: string;
  nome: string;
  cognome: string;
  iniziali: string;
  confermato: boolean;
  accompagnatore: boolean;
  invitatorePrincipale: string | null;
  invitatorePrincipaleId: string | null;
  posX: number | null;
  posY: number | null;
}

export interface TavoloDTO {
  id: string;
  matrimonio: string;
  nome: string | null;
  tipoTavolo: number;
  tipoTavoloDescrizione: string | null;
  posX: number | null;
  posY: number | null;
  larghezza: number | null;
  altezza: number | null;
  numeroPosti: number | null;
  dataCreazione: string;
  dataModifica: string;
  persone: PersonaTavoloDTO[];
}

export interface CreaTavoloRequest {
  nome?: string;
  tipoTavolo: number;
  posX?: number;
  posY?: number;
  larghezza?: number;
  altezza?: number;
  numeroPosti?: number;
}

export interface AggiornaTavoloRequest {
  nome?: string;
  tipoTavolo?: number;
  posX?: number;
  posY?: number;
  larghezza?: number;
  altezza?: number;
  numeroPosti?: number;
}

export interface AssegnaPersonaTavoloRequest {
  personaId: string;
  accompagnatore: boolean;
  posX?: number;
  posY?: number;
}

export enum TipoTavolo {
  CIRCOLARE = 1,
  RETTANGOLARE = 2
}

export interface ListaTavoliResponse {
  hasMatrimonio: boolean;
  tavoli: TavoloDTO[];
}
