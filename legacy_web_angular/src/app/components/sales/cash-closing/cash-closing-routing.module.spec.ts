
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CashClosingComponent } from './cash-closing.component';
import {routes} from "./cash-closing-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('CashClosingRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<CashClosingComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ CashClosingComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(CashClosingComponent);
    router.initialNavigation();
  }));
});

