
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInventoryTransfersComponent } from './search-inventory-transfers.component';
import {routes} from "./search-inventory-transfers-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('SearchInventoryTransfersRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<SearchInventoryTransfersComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ SearchInventoryTransfersComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(SearchInventoryTransfersComponent);
    router.initialNavigation();
  }));
});

