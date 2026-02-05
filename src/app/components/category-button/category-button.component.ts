import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonCard, IonCardContent, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-category-button',
  templateUrl: './category-button.component.html',
  styleUrls: ['./category-button.component.scss'],
  imports: [IonIcon, IonCard, IonCardContent, IonLabel]
})
export class CategoryButtonComponent  implements OnInit {

  @Input() label: string = 'Categoría';
  @Input() iconName: string = 'restaurant-outline'; 
  @Input() categoryId: string = '';

  constructor(private router: Router) {}

  goToCategory() {
    // Navegamos a la página 'products' pasando la categoría como parámetro (Query Params)
    if (this.categoryId) {
      this.router.navigate(['/products'], {
        queryParams: {
          category: this.categoryId
        }
      });
    } else {
      console.warn('No se definió categoryId en el botón');
    }
  }

  isImage(fileName: string): boolean {
  if (!fileName) return false;
    // Revisa si termina en .png, .jpg, .jpeg o .webp
    return fileName.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
  }

  ngOnInit() {}

}
