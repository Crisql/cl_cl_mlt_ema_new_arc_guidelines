
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CashFlowComponent } from './cash-flow.component';
import {routes} from "./cash-flow-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('CashFlowRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<CashFlowComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ CashFlowComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(CashFlowComponent);
    router.initialNavigation();
  }));
});

