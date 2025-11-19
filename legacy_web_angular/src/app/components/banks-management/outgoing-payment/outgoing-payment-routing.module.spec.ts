
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutgoingPaymentComponent } from './outgoing-payment.component';
import {routes} from "./outgoing-payment-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('OutgoingPaymentRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<OutgoingPaymentComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ OutgoingPaymentComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(OutgoingPaymentComponent);
    router.initialNavigation();
  }));
});

