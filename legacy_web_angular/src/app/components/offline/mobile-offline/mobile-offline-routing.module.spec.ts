
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileOfflineComponent } from './mobile-offline.component';
import {routes} from "./mobile-offline-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('MobileOfflineRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<MobileOfflineComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ MobileOfflineComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(MobileOfflineComponent);
    router.initialNavigation();
  }));
});

