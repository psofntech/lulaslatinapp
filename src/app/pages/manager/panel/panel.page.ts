import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { PushMockService } from 'src/app/services/push/push-mock.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, FormsModule]
})
export class PanelPage implements OnInit {

  constructor(private pushMock: PushMockService) { }

  ngOnInit() {
  }

  testPush() {
    this.pushMock.simulateNewOrder();
  }

}
