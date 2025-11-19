
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalPrinterComponent } from './local-printer.component';
import {routes} from "./local-printer-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('LocalPrinterRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<LocalPrinterComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ LocalPrinterComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(LocalPrinterComponent);
    router.initialNavigation();
  }));
});

