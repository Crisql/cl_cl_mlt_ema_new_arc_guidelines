
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchActivitiesComponent } from './search-activities.component';
import {routes} from "./search-activities-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('SearchActivitiesRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<SearchActivitiesComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ SearchActivitiesComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(SearchActivitiesComponent);
    router.initialNavigation();
  }));
});

