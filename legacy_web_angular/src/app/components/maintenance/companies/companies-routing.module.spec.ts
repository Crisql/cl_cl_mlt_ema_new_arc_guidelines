
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CompaniesComponent } from './companies.component';
import {routes} from "./companies-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('CompaniesRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<CompaniesComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ CompaniesComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(CompaniesComponent);
    router.initialNavigation();
  }));
});

