
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventViewerComponent } from './event-viewer.component';
import {routes} from "./event-viewer-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('EventViewerRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<EventViewerComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ EventViewerComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(EventViewerComponent);
    router.initialNavigation();
  }));
});

