import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { CartItem } from 'src/interfaces/cart.service';
import { Product } from 'src/interfaces/product.interface';

const CART_KEY = 'cart';

@Injectable({ providedIn: 'root' })
export class CartService {

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private async loadCart() {
    const { value } = await Preferences.get({ key: CART_KEY });
    const cart = value ? JSON.parse(value) : [];
    this.cartSubject.next(cart);
  }

  private async saveCart(cart: CartItem[]) {
    await Preferences.set({
      key: CART_KEY,
      value: JSON.stringify(cart)
    });
    this.cartSubject.next(cart);
  }

  async add(product: Product, quantity: number, notes?: string) {
    const cart = [...this.cartSubject.value];
    const item = cart.find(i => i.id === product.id);

    if (item) {
      item.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        notes,
        image: product.image
      });
    }

    await this.saveCart(cart);
  }

  async update(id: string, quantity: number) {
    const cart = [...this.cartSubject.value];
    const item = cart.find(i => i.id === id);
    if (item) item.quantity = quantity;
    await this.saveCart(cart);
  }

  async remove(id: string) {
    const cart = this.cartSubject.value.filter(i => i.id !== id);
    await this.saveCart(cart);
  }

  async clear() {
    await Preferences.remove({ key: CART_KEY });
    this.cartSubject.next([]);
  }

  async getCart(): Promise<CartItem[]> {
    const { value } = await Preferences.get({ key: CART_KEY });
    return value ? JSON.parse(value) : [];
  }
}
