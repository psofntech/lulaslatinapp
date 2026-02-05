import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-header-auth',
  templateUrl: './header-auth.component.html',
  styleUrls: ['./header-auth.component.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton]
})
export class HeaderAuthComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
