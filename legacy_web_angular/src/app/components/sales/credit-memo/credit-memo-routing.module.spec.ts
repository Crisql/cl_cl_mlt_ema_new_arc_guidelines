
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditMemoComponent } from './credit-memo.component';
import {routes} from "./credit-memo-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('CreditMemoRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<CreditMemoComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ CreditMemoComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(CreditMemoComponent);
    router.initialNavigation();
  }));
});

