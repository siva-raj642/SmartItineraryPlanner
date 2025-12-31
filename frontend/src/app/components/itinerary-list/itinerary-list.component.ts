import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItineraryService } from '../../services/itinerary.service';
import { Itinerary } from '../../models/itinerary.model';

@Component({
  selector: 'app-itinerary-list',
  templateUrl: './itinerary-list.component.html',
  styleUrls: ['./itinerary-list.component.scss']
})
export class ItineraryListComponent implements OnInit {
  itineraries: Itinerary[] = [];
  loading = true;
  errorMessage = '';
  
  // Filters
  destinationFilter = '';
  minBudgetFilter?: number;
  maxBudgetFilter?: number;
  startDateFilter?: string;
  endDateFilter?: string;

  constructor(
    private itineraryService: ItineraryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadItineraries();
  }

  loadItineraries(): void {
    this.loading = true;
    this.errorMessage = '';
    
    const filters: any = {};
    if (this.destinationFilter) filters.destination = this.destinationFilter;
    if (this.minBudgetFilter) filters.minBudget = this.minBudgetFilter;
    if (this.maxBudgetFilter) filters.maxBudget = this.maxBudgetFilter;
    if (this.startDateFilter) filters.startDate = this.startDateFilter;
    if (this.endDateFilter) filters.endDate = this.endDateFilter;

    this.itineraryService.getAllItineraries(filters).subscribe({
      next: (response) => {
        this.itineraries = response.itineraries;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load itineraries';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadItineraries();
  }

  clearFilters(): void {
    this.destinationFilter = '';
    this.minBudgetFilter = undefined;
    this.maxBudgetFilter = undefined;
    this.startDateFilter = undefined;
    this.endDateFilter = undefined;
    this.loadItineraries();
  }

  viewDetails(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/itineraries', id]);
    }
  }

  editItinerary(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/itineraries', id, 'edit']);
    }
  }

  deleteItinerary(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    this.itineraryService.deleteItinerary(id).subscribe({
      next: () => {
        this.loadItineraries();
      },
      error: (error) => {
        alert('Failed to delete itinerary');
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/itineraries/new']);
  }

  calculateTotalExpenses(itinerary: Itinerary): number {
    if (!itinerary.activities) return 0;
    return itinerary.activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);
  }

  getDuration(itinerary: Itinerary): number {
    const start = new Date(itinerary.start_date);
    const end = new Date(itinerary.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
}
