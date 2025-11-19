
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApprovalsComponent } from './approvals.component';
import {routes} from "./approvals-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('ApprovalsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<ApprovalsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ ApprovalsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(ApprovalsComponent);
    router.initialNavigation();
  }));
});

