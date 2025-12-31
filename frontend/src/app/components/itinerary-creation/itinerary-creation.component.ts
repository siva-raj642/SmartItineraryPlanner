import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ItineraryService } from '../../services/itinerary.service';

@Component({
  selector: 'app-itinerary-creation',
  templateUrl: './itinerary-creation.component.html',
  styleUrls: ['./itinerary-creation.component.scss']
})
export class ItineraryCreationComponent implements OnInit {
  itineraryForm!: FormGroup;
  loading = false;
  errorMessage = '';
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private itineraryService: ItineraryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itineraryForm = this.fb.group({
      destination: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      budget: [0, [Validators.required, Validators.min(0.01)]],
      preferences: [''],
      notes: [''],
      activities: this.fb.array([])
    });
  }

  get activities(): FormArray {
    return this.itineraryForm.get('activities') as FormArray;
  }

  addActivity(): void {
    const activityGroup = this.fb.group({
      name: ['', Validators.required],
      time: ['', Validators.required],
      duration: ['', Validators.required],
      estimatedCost: [0, Validators.min(0)],
      location: ['']
    });
    this.activities.push(activityGroup);
  }

  removeActivity(index: number): void {
    this.activities.removeAt(index);
  }

  onSubmit(): void {
    if (this.itineraryForm.invalid) {
      return;
    }

    // Validate dates
    const startDate = new Date(this.itineraryForm.value.start_date);
    const endDate = new Date(this.itineraryForm.value.end_date);
    
    if (endDate < startDate) {
      this.errorMessage = 'End date must be after start date';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = {
      ...this.itineraryForm.value,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };

    this.itineraryService.createItinerary(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/itineraries']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Failed to create itinerary';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/itineraries']);
  }
}
