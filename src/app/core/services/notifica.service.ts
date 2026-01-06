import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { NotificaDTO, NotificheCountResponse, NotifichePageResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificaService implements OnDestroy {
  private readonly apiUrl = `${environment.apiUrl}/notifica`;
  private stompClient: Client | null = null;
  private matrimonioId: string | null = null;

  private notificheSignal = signal<NotificaDTO[]>([]);
  private countNonLetteSignal = signal<number>(0);

  readonly notifiche = this.notificheSignal.asReadonly();
  readonly countNonLette = this.countNonLetteSignal.asReadonly();
  readonly hasNonLette = computed(() => this.countNonLetteSignal() > 0);

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  getNotifiche(page = 0, size = 50): Observable<NotifichePageResponse> {
    return this.http.get<NotifichePageResponse>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getUltimeNotifiche(): Observable<NotificaDTO[]> {
    return this.http.get<NotificaDTO[]>(`${this.apiUrl}/ultime`).pipe(
      tap((response) => this.notificheSignal.set(response))
    );
  }

  getCountNonLette(): Observable<NotificheCountResponse> {
    return this.http.get<NotificheCountResponse>(`${this.apiUrl}/non-lette/count`).pipe(
      tap((response) => this.countNonLetteSignal.set(response.count))
    );
  }

  segnaComeLetta(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/letta`, {}).pipe(
      tap(() => {
        // Aggiorna localmente
        const notifiche = this.notificheSignal();
        const updated = notifiche.map((n) => (n.id === id ? { ...n, letta: true } : n));
        this.notificheSignal.set(updated);
        // Decrementa il conteggio
        const currentCount = this.countNonLetteSignal();
        if (currentCount > 0) {
          this.countNonLetteSignal.set(currentCount - 1);
        }
      })
    );
  }

  segnaTutteComeLette(): Observable<{ updated: number }> {
    return this.http.put<{ updated: number }>(`${this.apiUrl}/lette-tutte`, {}).pipe(
      tap(() => {
        // Aggiorna localmente
        const notifiche = this.notificheSignal();
        const updated = notifiche.map((n) => ({ ...n, letta: true }));
        this.notificheSignal.set(updated);
        this.countNonLetteSignal.set(0);
      })
    );
  }

  connectWebSocket(matrimonioId: string): void {
    if (this.stompClient?.active) {
      return;
    }

    this.matrimonioId = matrimonioId;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connesso');
        this.subscribeToNotifications();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnesso');
      },
      onStompError: (frame) => {
        console.error('Errore STOMP:', frame.headers['message']);
      },
    });

    this.stompClient.activate();
  }

  disconnectWebSocket(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.matrimonioId = null;
  }

  private subscribeToNotifications(): void {
    if (!this.stompClient || !this.matrimonioId) {
      return;
    }

    this.stompClient.subscribe(
      `/topic/notifiche/${this.matrimonioId}`,
      (message: IMessage) => {
        const notifica: NotificaDTO = JSON.parse(message.body);
        this.addNotifica(notifica);
      }
    );
  }

  private addNotifica(notifica: NotificaDTO): void {
    const notifiche = this.notificheSignal();
    // Aggiungi in cima
    this.notificheSignal.set([notifica, ...notifiche.slice(0, 9)]);
    // Incrementa conteggio non lette
    if (!notifica.letta) {
      this.countNonLetteSignal.set(this.countNonLetteSignal() + 1);
    }
  }

  clearCache(): void {
    this.notificheSignal.set([]);
    this.countNonLetteSignal.set(0);
  }
}
