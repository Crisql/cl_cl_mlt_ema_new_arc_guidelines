
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintVoidCardsComponent } from './print-void-cards.component';
import {routes} from "./print-void-cards-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PrintVoidCardsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PrintVoidCardsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PrintVoidCardsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PrintVoidCardsComponent);
    router.initialNavigation();
  }));
});

