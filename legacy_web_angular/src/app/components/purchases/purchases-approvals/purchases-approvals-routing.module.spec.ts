
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchasesApprovalsComponent } from './purchases-approvals.component';
import {routes} from "./purchases-approvals-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PurchasesApprovalsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PurchasesApprovalsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PurchasesApprovalsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PurchasesApprovalsComponent);
    router.initialNavigation();
  }));
});

