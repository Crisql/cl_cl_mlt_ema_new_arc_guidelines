
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PosOfflineComponent } from './pos-offline.component';
import {routes} from "./pos-offline-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PosOfflineRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PosOfflineComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PosOfflineComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PosOfflineComponent);
    router.initialNavigation();
  }));
});

