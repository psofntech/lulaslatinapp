import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { MenuCategoryItem } from 'src/interfaces/menu-category.interface';
import { CategoryButtonComponent } from "src/app/components/category-button/category-button.component";
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, IonIcon, IonCard, IonCardContent, CategoryButtonComponent]
})
export class MenuPage implements OnInit {

  categories: MenuCategoryItem[] = [
    {
      label: 'BREAKFAST',
      categoryId: 'BREAKFAST',
      iconName: 'breakfast.svg',
    },
    {
      label: 'SOUPS',
      categoryId: 'SOUPS',
      iconName: 'soups.svg',
    },
    {
      label: 'BREAKFAST SANDWICHES',
      categoryId: 'BREAKFAST_SANDWICHES',
      iconName: 'breakfastSandwiches.svg',
    },
    {
      label: 'APPETIZERS',
      categoryId: 'APPETIZERS',
      iconName: 'appetizers.svg',
    },
    {
      label: 'DAILY SPECIAL (LUNCH - DINNER)',
      categoryId: 'DAILY_SPECIAL',
      iconName: 'dailySpecial.svg',
    },
    {
      label: 'LULAS COMBO',
      categoryId: 'LULAS_COMBO',
      iconName: 'lulasCombo.svg',
    },
    {
      label: 'MOFONGOS',
      categoryId: 'MOFONGOS',
      iconName: 'mofongos.svg',
    },
    {
      label: 'SANDWICHES',
      categoryId: 'SANDWICHES',
      iconName: 'sandwiches.svg',
    },
    {
      label: 'SIDE ORDERS',
      categoryId: 'SIDE_ORDERS',
      iconName: 'sideOrders.svg',
    },
    {
      label: 'CHICKEN',
      categoryId: 'CHICKEN',
      iconName: 'chicken.svg',
    },
    {
      label: 'MEAT',
      categoryId: 'MEAT',
      iconName: 'meat.svg',
    },
    {
      label: 'HOUSE SPECIALTIES',
      categoryId: 'HOUSE_SPECIALTIES',
      iconName: 'houseSpecialties.svg',
    },
    {
      label: 'SALADS',
      categoryId: 'SALADS',
      iconName: 'salads.svg',
    },
    {
      label: 'DESSERTS',
      categoryId: 'DESSERTS',
      iconName: 'desserts.svg',
    },
    {
      label: 'BEVERAGES / JUICES / JUGOS',
      categoryId: 'BEVERAGES_JUICES_JUGOS',
      iconName: 'juices.svg',
    },
    {
      label: 'FISH AND SEAFOOD',
      categoryId: 'FISH_AND_SEAFOOD',
      iconName: 'fish.svg',
    },
    {
      label: 'COMBO',
      categoryId: 'COMBO',
      iconName: 'combo.svg',
    },
    {
      label: 'DOMINICAN SANDWICHES',
      categoryId: 'DOMINICAN_SANDWICHES',
      iconName: 'food-placeholder.png',
    },
  ];

  isLoggedIn: boolean = false;


  constructor(
    private auth: AuthService
  ) { }

  async ngOnInit() {
    this.isLoggedIn = await this.auth.isLoggedIn();
  }

}
