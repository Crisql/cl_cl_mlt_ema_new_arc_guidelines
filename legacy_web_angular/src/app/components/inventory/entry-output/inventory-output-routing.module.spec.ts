
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryOutputComponent } from './inventory-output.component';
import {routes} from "./inventory-output-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('InventoryOutputRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<InventoryOutputComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ InventoryOutputComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(InventoryOutputComponent);
    router.initialNavigation();
  }));
});

