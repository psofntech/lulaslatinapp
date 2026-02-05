import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type SelectType = 'pickup' | 'delivery';

export interface CheckoutState {
  selectType: SelectType;
  tipType: string | null;
  customTipAmount: number | null;
  isSkipped: boolean;
}

const STORAGE_KEY = 'checkout_state';

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {

  private defaultState: CheckoutState = {
    selectType: 'pickup',
    tipType: null,
    customTipAmount: null,
    isSkipped: false
  };

  async getState(): Promise<CheckoutState> {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (!value) return this.defaultState;

    try {
      return { ...this.defaultState, ...JSON.parse(value) };
    } catch {
      return this.defaultState;
    }
  }

  async saveState(state: Partial<CheckoutState>) {
    const current = await this.getState();
    const next = { ...current, ...state };

    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(next)
    });
  }

  async clear() {
    await Preferences.remove({ key: STORAGE_KEY });
  }

  // Helpers elegantes

  async setSelectType(type: SelectType) {
    await this.saveState({ selectType: type });
  }

  async setTip(type: string | null, amount: number | null = null) {
    await this.saveState({
      tipType: type,
      customTipAmount: amount,
      isSkipped: false
    });
  }

  async skipTip() {
    await this.saveState({
      tipType: null,
      customTipAmount: null,
      isSkipped: true
    });
  }
}
