import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

const WS_URL = 'wss://dreamlike-esme-loonily.ngrok-free.dev';

@Injectable({ providedIn: 'root' })
export class WebSocketService {

  private socket?: WebSocket;
  private messages$ = new Subject<any>();


  stream$ = this.messages$.asObservable();

  constructor(private zone: NgZone) {}

  connect() {
    if (this.socket) return;

    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => console.log('🟢 WS connected');

    this.socket.onmessage = (event) => {
      this.zone.run(() => {
        this.messages$.next(JSON.parse(event.data));
      });
    };

    this.socket.onerror = err => console.error('🔴 WS error', err);

    this.socket.onclose = () => {
      console.warn('⚠️ WS closed, reconnecting...');
      this.socket = undefined;
      setTimeout(() => this.connect(), 3000);
    };
  }
}
