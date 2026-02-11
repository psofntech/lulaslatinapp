import { Component, Input } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonDatetime,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-filter-modal',
  templateUrl: './date-filter-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonDatetime,
    IonItem,
    IonLabel
  ],
  providers:[ModalController]
})
export class DateFilterModalPage {

  @Input() fromDate!: string | null;
  @Input() toDate!: string | null;

  constructor(private modalCtrl: ModalController) {}

  apply() {
    this.modalCtrl.dismiss({
      from: this.fromDate,
      to: this.toDate
    });
  }

  clear() {
    this.fromDate = null;
    this.toDate = null;

    this.modalCtrl.dismiss({
      from: null,
      to: null
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
