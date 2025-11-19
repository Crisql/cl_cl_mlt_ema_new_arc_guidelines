
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryTransferComponent } from './inventory-transfer.component';
import {routes} from "./inventory-transfer-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('InventoryTransferRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<InventoryTransferComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ InventoryTransferComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(InventoryTransferComponent);
    router.initialNavigation();
  }));
});

