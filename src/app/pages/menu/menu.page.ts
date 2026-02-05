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
      lavel: 'BREAKFAST',
      categoryId: 'BREAKFAST',
      iconName: 'breakfast.svg',
    },
    {
      lavel: 'SOUPS',
      categoryId: 'SOUPS',
      iconName: 'soups.svg',
    },
    {
      lavel: 'BREAKFAST SANDWICHES',
      categoryId: 'BREAKFAST_SANDWICHES',
      iconName: 'breakfastSandwiches.svg',
    },
    {
      lavel: 'APPETIZERS',
      categoryId: 'APPETIZERS',
      iconName: 'appetizers.svg',
    },
    {
      lavel: 'DAILY SPECIAL (LUNCH - DINNER)',
      categoryId: 'DAILY_SPECIAL',
      iconName: 'dailySpecial.svg',
    },
    {
      lavel: 'LULAS COMBO',
      categoryId: 'LULAS_COMBO',
      iconName: 'lulasCombo.svg',
    },
    {
      lavel: 'MOFONGOS',
      categoryId: 'MOFONGOS',
      iconName: 'mofongos.svg',
    },
    {
      lavel: 'SANDWICHES',
      categoryId: 'SANDWICHES',
      iconName: 'sandwiches.svg',
    },
    {
      lavel: 'SIDE ORDERS',
      categoryId: 'SIDE_ORDERS',
      iconName: 'sideOrders.svg',
    },
    {
      lavel: 'CHICKEN',
      categoryId: 'CHICKEN',
      iconName: 'chicken.svg',
    },
    {
      lavel: 'MEAT',
      categoryId: 'MEAT',
      iconName: 'meat.svg',
    },
    {
      lavel: 'HOUSE SPECIALTIES',
      categoryId: 'HOUSE_SPECIALTIES',
      iconName: 'houseSpecialties.svg',
    },
    {
      lavel: 'SALADS',
      categoryId: 'SALADS',
      iconName: 'salads.svg',
    },
    {
      lavel: 'DESSERTS',
      categoryId: 'DESSERTS',
      iconName: 'desserts.svg',
    },
    {
      lavel: 'BEVERAGES / JUICES / JUGOS',
      categoryId: 'BEVERAGES_JUICES_JUGOS',
      iconName: 'juices.svg',
    },
    {
      lavel: 'FISH AND SEAFOOD',
      categoryId: 'FISH_AND_SEAFOOD',
      iconName: 'fish.svg',
    },
    {
      lavel: 'COMBO',
      categoryId: 'COMBO',
      iconName: 'combo.svg',
    },
    {
      lavel: 'DOMINICAN SANDWICHES',
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
