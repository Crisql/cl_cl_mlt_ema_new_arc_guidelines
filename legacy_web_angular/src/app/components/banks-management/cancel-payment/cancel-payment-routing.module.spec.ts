
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelPaymentComponent } from './cancel-payment.component';
import {routes} from "./cancel-payment-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('CancelPaymentRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<CancelPaymentComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ CancelPaymentComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(CancelPaymentComponent);
    router.initialNavigation();
  }));
});

