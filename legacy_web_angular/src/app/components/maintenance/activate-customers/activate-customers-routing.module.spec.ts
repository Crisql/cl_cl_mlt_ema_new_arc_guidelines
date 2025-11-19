
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivateCustomersComponent } from './activate-customers.component';
import {routes} from "./activate-customers-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('ActivateCustomersRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<ActivateCustomersComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ ActivateCustomersComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(ActivateCustomersComponent);
    router.initialNavigation();
  }));
});

