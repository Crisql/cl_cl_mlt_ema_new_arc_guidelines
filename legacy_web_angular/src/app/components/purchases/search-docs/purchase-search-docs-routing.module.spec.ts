
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseSearchDocsComponent } from './purchase-search-docs.component';
import {routes} from "./purchase-search-docs-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PurchaseSearchDocsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PurchaseSearchDocsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PurchaseSearchDocsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PurchaseSearchDocsComponent);
    router.initialNavigation();
  }));
});

