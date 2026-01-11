import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ItineraryService } from "../../services/itinerary.service";
import { PageTitleService } from "../../services/page-title.service";
import { CityService } from "../../services/city.service";
import { Observable, of } from "rxjs";
import {
  map,
  startWith,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from "rxjs/operators";
import { DestinationMapComponent } from "../../shared/components/destination-map/destination-map.component";

@Component({
  selector: "app-itinerary-creation",
  templateUrl: "./itinerary-creation.component.html",
  styleUrls: ["./itinerary-creation.component.scss"],
})
export class ItineraryCreationComponent implements OnInit {
  @ViewChild("destinationMap") destinationMap!: DestinationMapComponent;

  itineraryForm!: FormGroup;
  loading = false;
  errorMessage = "";
  minDate = new Date();

  // City autocomplete
  filteredCities!: Observable<string[]>;
  destinationControl = new FormControl("", [Validators.required]);
  isSearching = false;
  selectedDestinationCoords: [number, number] | null = null;

  constructor(
    private fb: FormBuilder,
    private itineraryService: ItineraryService,
    private cityService: CityService,
    private pageTitle: PageTitleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itineraryForm = this.fb.group({
      destination: this.destinationControl,
      start_date: ["", [Validators.required]],
      end_date: ["", [Validators.required]],
      budget: [0, [Validators.required, Validators.min(0.01)]],
      preferences: [""],
      notes: [""],
      activities: this.fb.array([]),
    });

    // Setup dynamic city autocomplete with API
    this.filteredCities = this.destinationControl.valueChanges.pipe(
      startWith(""),
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(),
      switchMap((value) => {
        this.isSearching = true;
        if (!value || value.length < 2) {
          this.isSearching = false;
          return of(this.cityService.getPopularDestinations());
        }
        return this.cityService.searchCities(value, 15).pipe(
          map((cities) => {
            this.isSearching = false;
            return cities;
          })
        );
      })
    );
  }

  onDestinationSelected(event: any): void {
    const selectedCity = event.option.value;
    if (selectedCity) {
      this.cityService.getCoordinates(selectedCity).subscribe((coords) => {
        if (coords && this.destinationMap) {
          this.selectedDestinationCoords = coords;
          this.destinationMap.updateDestination(selectedCity, coords);
        }
      });
    }
  }

  get activities(): FormArray {
    return this.itineraryForm.get("activities") as FormArray;
  }

  addActivity(): void {
    const activityGroup = this.fb.group({
      name: ["", Validators.required],
      time: ["", Validators.required],
      duration: ["", Validators.required],
      estimatedCost: [0, Validators.min(0)],
      location: [""],
    });
    this.activities.push(activityGroup);
  }

  removeActivity(index: number): void {
    this.activities.removeAt(index);
  }

  onSubmit(): void {
    if (this.itineraryForm.invalid) return;

    const startDate = new Date(this.itineraryForm.value.start_date);
    const endDate = new Date(this.itineraryForm.value.end_date);

    if (endDate < startDate) {
      this.errorMessage = "End date must be after start date";
      return;
    }

    this.loading = true;
    this.loadingPhase = 1;
    this.currentIconIndex = 0;
    this.errorMessage = "";

    const formData = {
      ...this.itineraryForm.value,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    };

    const ICON_DURATION = 1500;
    const TOTAL_ICON_TIME = ICON_DURATION * this.barrelIcons.length;
    const MIN_RUNNER_TIME = 900; // ⭐ ensures runner is visible

    let apiResponse: any = null;

    // 🔁 ICON SEQUENCE (UNCHANGED)
    this.barrelIcons.forEach((_, index) => {
      setTimeout(() => {
        this.currentIconIndex = index;
      }, ICON_DURATION * index);
    });

    // 🚀 API CALL (parallel)
    this.itineraryService.createItinerary(formData).subscribe({
      next: (response) => {
        apiResponse = response;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || "Failed to create itinerary";
      },
    });

    // 🎬 AFTER ICONS → RUNNER
    setTimeout(() => {
      this.loadingPhase = 0 as any;

      setTimeout(() => {
        this.loadingPhase = 2;
        this.startRunnerAnimation();

        // ⏱ GUARANTEED RUNNER VISIBILITY
        setTimeout(() => {
          if (!apiResponse) return;

          this.loading = false;
          const destination = this.itineraryForm.value.destination;
          if (destination) {
            this.pageTitle.setDestination(destination);
          }
          const createdId = apiResponse?.itinerary?.id;

          if (createdId) {
            this.router.navigate(["/itineraries", createdId]);
          } else {
            this.router.navigate(["/itineraries"]);
          }
        }, MIN_RUNNER_TIME);
      }, 50);
    }, TOTAL_ICON_TIME);
  }

  cancel(): void {
    this.router.navigate(["/itineraries"]);
  }

  loadingPhase: 1 | 2 = 1;

  barrelIcons: string[] = [
    "assets/icons/newform/g1.svg",
    "assets/icons/newform/g2.svg",
    "assets/icons/newform/g3.svg",
    "assets/icons/newform/g4.svg",
    "assets/icons/newform/g5.svg",
  ];

  currentIconIndex = 0;

  runnerFrames: string[] = [
    "assets/icons/newform/run1.svg",
    "assets/icons/newform/run2.svg",
  ];

  currentRunnerFrame = 0;
  runnerInterval!: any;

  startRunnerAnimation() {
    this.currentRunnerFrame = 0;
    this.runnerX = -30;

    this.runnerInterval = setInterval(() => {
      // Alternate legs
      this.currentRunnerFrame =
        (this.currentRunnerFrame + 1) % this.runnerFrames.length;

      // Move forward
      this.runnerX += this.runnerStep;

      // Stop when fully out on right
      if (this.runnerX > 260) {
        // approx button width
        this.stopRunnerAnimation();
      }
    }, 80); // FAST cadence → realistic run
  }

  stopRunnerAnimation() {
    clearInterval(this.runnerInterval);
  }

  runnerX = -70; // start outside left
  runnerStep = 8; // how much it moves each step (px)
}
