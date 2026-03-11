import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuyerHeaderComponent } from '../shared/buyer-header/buyer-header.component';

@Component({
  selector: 'app-buyer-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BuyerHeaderComponent],
  templateUrl: './buyer-home.component.html',
  styleUrls: ['./buyer-home.component.css']
})
export class BuyerHomeComponent {
  origins = [
    { id: 'Iran', flag: '🇮🇷', name: 'Persian' },
    { id: 'India', flag: '🇮🇳', name: 'Kashmiri' },
    { id: 'Spain', flag: '🇪🇸', name: 'Spanish' }
  ];

  grades = [
    { id: 'premium', name: 'Premium', class: 'premium' },
    { id: 'first', name: 'Grade I', class: 'first' },
    { id: 'second', name: 'Grade II', class: 'second' }
  ];
}
