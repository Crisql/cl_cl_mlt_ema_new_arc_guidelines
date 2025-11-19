
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PreclosingCardsComponent } from './preclosing-cards.component';
import {routes} from "./preclosing-cards-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PreclosingCardsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PreclosingCardsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PreclosingCardsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PreclosingCardsComponent);
    router.initialNavigation();
  }));
});

