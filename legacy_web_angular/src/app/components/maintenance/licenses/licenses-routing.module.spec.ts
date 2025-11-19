
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LicensesComponent } from './licenses.component';
import {routes} from "./licenses-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('LicensesRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<LicensesComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ LicensesComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(LicensesComponent);
    router.initialNavigation();
  }));
});

