import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonCard, IonCardContent, IonButton, IonIcon]
})
export class SuccessPage {

  constructor(private navCtrl: NavController) {
    addIcons({ checkmarkCircleOutline });
  }

  goHome() {
    this.navCtrl.navigateRoot('/home'); // redirige al home
  }

}
