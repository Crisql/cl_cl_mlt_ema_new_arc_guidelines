
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchasesDocumentComponent } from './purchases-document.component';
import {routes} from "./purchases-document-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PurchasesDocumentRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PurchasesDocumentComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PurchasesDocumentComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PurchasesDocumentComponent);
    router.initialNavigation();
  }));
});

