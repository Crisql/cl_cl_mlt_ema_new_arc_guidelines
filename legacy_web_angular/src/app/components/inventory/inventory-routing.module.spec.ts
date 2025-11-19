
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {routes} from "./inventory-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('InventoryRoutingModule', () => {
  let router: Router;
  let location: Location;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    router.initialNavigation();
  }));
});

