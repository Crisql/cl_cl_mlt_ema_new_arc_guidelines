
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesDocumentComponent } from './sales-document.component';
import {routes} from "./sales-document-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('SalesDocumentRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<SalesDocumentComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ SalesDocumentComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(SalesDocumentComponent);
    router.initialNavigation();
  }));
});

