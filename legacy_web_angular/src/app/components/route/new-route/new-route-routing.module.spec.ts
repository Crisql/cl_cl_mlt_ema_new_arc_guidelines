
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewRouteComponent } from './new-route.component';
import {routes} from "./new-route-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('NewRouteRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<NewRouteComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ NewRouteComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(NewRouteComponent);
    router.initialNavigation();
  }));
});

