
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivitiesComponent } from './activities.component';
import {routes} from "./activities-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('ActivitiesRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<ActivitiesComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ ActivitiesComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(ActivitiesComponent);
    router.initialNavigation();
  }));
});

