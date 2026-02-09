import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AlertFeedbackService {
  private userInteracted = false;

  registerUserInteraction() {
    this.userInteracted = true;
  }

  play(sound: 'new' | 'critical') {
    if (!this.userInteracted) return;

    const src =
      sound === 'new'
        ? 'assets/sounds/alertNew.mp3'
        : 'assets/sounds/alertcritical.mp3';

    const audio = new Audio(src);
    audio.play().catch(() => {});
  }

  vibrate(pattern = [300, 200, 300]) {
    if (!this.userInteracted) return;
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}
