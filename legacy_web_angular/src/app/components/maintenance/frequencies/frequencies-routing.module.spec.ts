
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FrequenciesComponent } from './frequencies.component';
import {routes} from "./frequencies-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('FrequenciesRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<FrequenciesComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ FrequenciesComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(FrequenciesComponent);
    router.initialNavigation();
  }));
});

