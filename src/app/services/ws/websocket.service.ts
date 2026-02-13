import { Injectable, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { Subject } from 'rxjs';
import { PushService } from '../push/push.service';
import { AuthStorageService } from '../auth-storage';
import { environment } from 'src/environments/environment';

const WS_URL = environment.wsUrl;

@Injectable({ providedIn: 'root' })
export class WebSocketService {

  private socket?: WebSocket;
  private messages$ = new Subject<any>();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8;
  private token?: string;


  stream$ = this.messages$.asObservable();

  constructor(
    private zone: NgZone,
    private pushService: PushService,
    private authStorage: AuthStorageService
  ) {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('🔄 App resumed, rechecking WS');
        this.initWebSocket();
      }
    });
  }

  async initWebSocket() {
    this.token = await this.authStorage.getToken() ?? undefined;

    if (!this.token) return;

    this.connect();
  }

  async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.token = await this.authStorage.getToken() ?? undefined;
    if (!this.token) {
      console.warn('WS aborted: no token');
      return;
    }

    const url = `${WS_URL}?token=${this.token}`;

    this.socket = new WebSocket(url);  

    this.socket.onopen = () => {
      console.log('🟢 WS Connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      this.zone.run(() => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch {
          console.warn('Invalid WS payload');
        }
      });
    };

    this.socket.onclose = () => {
      this.socket = undefined;
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  private scheduleReconnect() {

    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private handleMessage(data: any) {

    if (data.type === 'order_created') {

      this.pushService.handleIncomingPush({
        id: data.id,
        title: 'Nueva Orden',
        body: data.message,
        type: data.type,
        data,
        createdAt: new Date(),
        read: false
      });

    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = undefined;
    this.reconnectAttempts = 0;
  }
}
