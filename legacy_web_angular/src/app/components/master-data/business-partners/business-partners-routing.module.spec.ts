
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessPartnersComponent } from './business-partners.component';
import {routes} from "./business-partners-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('BusinessPartnersRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<BusinessPartnersComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ BusinessPartnersComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(BusinessPartnersComponent);
    router.initialNavigation();
  }));
});

