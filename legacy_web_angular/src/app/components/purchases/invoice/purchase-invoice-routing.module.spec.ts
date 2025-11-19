
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseInvoiceComponent } from './purchase-invoice.component';
import {routes} from "./purchase-invoice-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PurchaseInvoiceRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PurchaseInvoiceComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PurchaseInvoiceComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PurchaseInvoiceComponent);
    router.initialNavigation();
  }));
});

