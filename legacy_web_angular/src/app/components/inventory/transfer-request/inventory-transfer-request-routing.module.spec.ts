
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryTransferRequestComponent } from './inventory-transfer-request.component';
import {routes} from "./inventory-transfer-request-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('InventoryTransferRequestRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<InventoryTransferRequestComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ InventoryTransferRequestComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(InventoryTransferRequestComponent);
    router.initialNavigation();
  }));
});

