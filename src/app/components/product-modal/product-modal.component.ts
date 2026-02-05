import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Product } from 'src/interfaces/product.interface';

import { addIcons } from 'ionicons';
import { removeCircleOutline, addCircleOutline, close } from 'ionicons/icons'

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  imports: [IonicModule, FormsModule]
})
export class ProductModalComponent {

  @Input() product: Product = {
    id: '',
    name: '',
    categoryId: '',
    price: 0,
    image: '',
    description: ''
  };

  quantity: number = 1;
  notes: string = '';

  constructor(private modalController: ModalController) {
    addIcons({
      removeCircleOutline,
      addCircleOutline,
      close
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  confirm() {
    this.modalController.dismiss({
      quantity: this.quantity,
      notes: this.notes
    });
  }

  // Funciones para los botones + y -
  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
