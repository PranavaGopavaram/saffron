import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-buyer-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-footer.component.html',
  styleUrls: ['./buyer-footer.component.css']
})
export class BuyerFooterComponent {
  currentYear = new Date().getFullYear();
}
