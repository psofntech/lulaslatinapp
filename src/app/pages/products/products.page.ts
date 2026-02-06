import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, ToastController, IonContent, IonCard, IonCardContent, IonSegment, IonSegmentButton, IonIcon, IonButton, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { MenuCategoryItem } from 'src/interfaces/menu-category.interface';
import { Product } from '../../../interfaces/product.interface';
import { ProductModalComponent } from 'src/app/components/product-modal/product-modal.component';

import { addIcons } from 'ionicons';
import { gridOutline, listOutline } from 'ionicons/icons'
import { AuthService } from 'src/app/services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent, IonCard, IonCardContent, IonSegment, IonSegmentButton, IonIcon, IonButton, IonGrid, IonCol, IonRow],
  providers: [ToastController]
})
export class ProductsPage implements OnInit {

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

    // Datos Mock de Productos (Simulación)
  allProducts: Product[] = [
    { id: '1', name: 'Huevos con Tocino', categoryId: 'BREAKFAST', price: 8.50, image: 'assets/placeholder.png', description: 'Deliciosos huevos revueltos con tocino crocante.' },
    { id: '1', name: 'Huevos Revueltos', categoryId: 'BREAKFAST', price: 9.50, image: 'assets/placeholder.png', description: 'Deliciosos huevos revueltos.' },
    { id: '2', name: 'Mofongo con Camarones', categoryId: 'MOFONGOS', price: 15.00, image: 'assets/placeholder.png', description: 'Plátano verde aplastado con camarones al ajillo.' },
    { id: '3', name: 'Sancocho Dominicano', categoryId: 'SOUPS', price: 12.00, image: 'assets/placeholder.png', description: 'Caldo tradicional con carne y vegetales.' },
  ];

  selectedCategory: string = 'BREAKFAST'; // Categoría por defecto
  filteredProducts: Product[] = [];

  viewMode: 'grid' | 'list' = 'grid'; 
  
  isLoggedIn: boolean = false;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {
    this.filterProducts();
    addIcons({
      gridOutline,
      listOutline
    })
   }

   

  filterProducts() {
    this.filteredProducts = this.allProducts.filter(p => p.categoryId === this.selectedCategory);
  }

  getCategoryName(categoryId: string): string {
    const cat = this.categories.find(c => c.categoryId === categoryId);
    return cat ? cat.lavel : '';
  }

  async openModal(product: Product, ev: Event) {
    ev.stopPropagation();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: { product },
      backdropDismiss: false
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === 'confirm') {
      this.cartService.add(product, data.quantity, data.notes);
      this.showToast(`Agregado ${product.name}`);
    }
  }
  
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  onSegmentChange() {
    console.log('Categoría cambiada a:', this.selectedCategory);
    this.filterProducts();
  }

  async ngOnInit() {
    this.isLoggedIn = await this.auth.isLoggedIn();

    this.route.queryParams.subscribe(params => {
      const categoryFromUrl = params['category'];

      if (categoryFromUrl) {
        this.selectedCategory = categoryFromUrl;
      } else {
        this.selectedCategory = 'BREAKFAST'; // fallback
      }

      this.filterProducts();
    });
  }

}
