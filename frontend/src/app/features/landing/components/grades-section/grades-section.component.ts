import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GRADES_DATA } from '../../data/grade.data';
import { Grade } from '../../models/grade.model';
@Component({
  selector: 'app-grades-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grades-section.component.html',
  styleUrls: ['./grades-section.component.css']
})
export class GradesSectionComponent {
  grades: Grade[] = GRADES_DATA;
}