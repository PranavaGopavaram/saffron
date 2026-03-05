import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-card">
        <h1>My Addresses</h1>
        <p>Address management coming in Phase 6</p>
        <a routerLink="/buyer/dashboard" class="back-link">Back to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .placeholder-card {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    h1 { margin: 0 0 1rem; color: #333; }
    p { color: #666; margin-bottom: 1.5rem; }
    .back-link {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
    }
    .back-link:hover { background: #5a6fd6; }
  `]
})
export class AddressListComponent {}
