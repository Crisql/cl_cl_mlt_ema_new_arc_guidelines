
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PpstoredTransactionsComponent } from './ppstored-transactions.component';
import {routes} from "./ppstored-transactions-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('PpstoredTransactionsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<PpstoredTransactionsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ PpstoredTransactionsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(PpstoredTransactionsComponent);
    router.initialNavigation();
  }));
});

