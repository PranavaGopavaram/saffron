import { Component } from '@angular/core';
@Component({
  selector: 'app-hero-section',
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent {
  scrollToGrades(): void {
    const gradesSection = document.getElementById('grades-section');
    if (gradesSection) {
      gradesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}