import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
  IonInput,
  IonTextarea,
  IonList,
  IonItem,
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';

import { Product } from 'src/interfaces/product.interface';

import { addIcons } from 'ionicons';
import { close, removeCircleOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel,
    IonList
  ]
})
export class ProductModalComponent {

  @Input({ required: true }) product!: Product;

  quantity = 1;
  notes = '';

  constructor(private modalCtrl: ModalController) {
    addIcons({close, removeCircleOutline, addCircleOutline})
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(
      {
        quantity: this.quantity,
        notes: this.notes
      },
      'confirm'
    );
  }

  inc() {
    this.quantity++;
  }

  dec() {
    if (this.quantity > 1) this.quantity--;
  }
}
