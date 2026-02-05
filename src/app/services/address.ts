import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface Address {
  id: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  isFavorite?: boolean;
}

const ADDRESSES_KEY = 'user_addresses';
const SELECTED_KEY = 'selected_address_id';

@Injectable({ providedIn: 'root' })
export class AddressService {

  // 🔹 Obtener todas las direcciones
  async getAddresses(): Promise<Address[]> {
    const { value } = await Preferences.get({ key: ADDRESSES_KEY });
    return value ? JSON.parse(value) : [];
  }

  // 🔹 Guardar todas las direcciones (privado)
  private async save(addresses: Address[]) {
    await Preferences.set({
      key: ADDRESSES_KEY,
      value: JSON.stringify(addresses)
    });
  }

  // 🔹 Agregar una dirección
  async add(address: Address) {
    const addresses = await this.getAddresses();
    addresses.push(address);
    await this.save(addresses);
  }

  // 🔹 Eliminar una dirección por id
  async remove(id: string) {
    let addresses = await this.getAddresses();
    addresses = addresses.filter(a => a.id !== id);
    await this.save(addresses);

    // Si la dirección eliminada estaba seleccionada, limpiar selección
    const selected = await this.getSelectedAddress();
    if (selected?.id === id) {
      await this.clearSelectedAddress();
    }
  }

  // 🔹 Actualizar los datos de una dirección
  async update(updated: Address) {
    const addresses = await this.getAddresses();
    const index = addresses.findIndex(a => a.id === updated.id);
    if (index === -1) throw new Error('Address not found');

    addresses[index] = { ...addresses[index], ...updated };
    await this.save(addresses);
  }

  // 🔹 Activar/desactivar isFavorite
  async toggleFavorite(id: string) {
    const addresses = await this.getAddresses();
    const index = addresses.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Address not found');

    // Solo puede haber una dirección favorita
    addresses.forEach(a => a.isFavorite = false);
    addresses[index].isFavorite = true;

    await this.save(addresses);
  }

  // 🔹 Seleccionar dirección
  async setSelectedAddressId(id: string) {
    await Preferences.set({ key: SELECTED_KEY, value: id });
  }

  // 🔹 Obtener dirección seleccionada
  async getSelectedAddress(): Promise<Address | null> {
    const { value: id } = await Preferences.get({ key: SELECTED_KEY });
    if (!id) return null;

    const addresses = await this.getAddresses();
    return addresses.find(a => a.id === id) || null;
  }

  // 🔹 Limpiar selección
  async clearSelectedAddress() {
    await Preferences.remove({ key: SELECTED_KEY });
  }
}
