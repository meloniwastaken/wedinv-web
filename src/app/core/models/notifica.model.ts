export interface NotificaDTO {
  id: string;
  matrimonio: string;
  tipoNotifica: number;
  attore: string;
  titolo: string;
  messaggio: string | null;
  invitato: string | null;
  link: string | null;
  letta: boolean;
  dataCreazione: string;
}

export interface NotificheCountResponse {
  count: number;
}

export interface NotifichePageResponse {
  content: NotificaDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export enum TipoNotificaEnum {
  CONFERMA_INVITATO = 1,
  RIFIUTO_INVITATO = 2,
  MODIFICA_INTOLLERANZE = 3,
  MODIFICA_PLUS = 4,
  INVIO_INVITI = 5,
  CAMBIO_STATO_INVITO = 6,
}

export enum AttoreNotificaEnum {
  INVITATO = 'INVITATO',
  SPOSI = 'SPOSI',
}
