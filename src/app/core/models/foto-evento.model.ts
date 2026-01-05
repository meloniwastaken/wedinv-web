export interface FotoEventoDTO {
  id: string;
  fotoBase64: string;
  nomeFile?: string | null;
  dataCaricamento: string;
  nomeInvitato?: string;
  cognomeInvitato?: string;
}

export interface FotoEventoListResponse {
  foto: FotoEventoDTO[];
  totale: number;
  maxFotoPerInvitato: number;
  fotoCaricateDaMe: number;
  uploadAbilitato: boolean;
}

export interface UploadFotoEventoRequest {
  fotoBase64: string;
  nomeFile?: string | null;
}

export interface InvitatoConFoto {
  invitatoId: string;
  nome: string;
  cognome: string;
  numeroFoto: number;
  foto: FotoEventoDTO[];
}

export interface FotoEventoAdminResponse {
  hasMatrimonio: boolean;
  fotoSposi: FotoEventoDTO[];
  totaleFotoSposi: number;
  invitatiConFoto: InvitatoConFoto[];
  totaleInvitatiConFoto: number;
  totaleFotoInvitati: number;
}
