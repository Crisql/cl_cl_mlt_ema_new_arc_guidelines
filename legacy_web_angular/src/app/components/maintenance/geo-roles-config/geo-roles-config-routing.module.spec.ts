
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GeoRolesConfigComponent } from './geo-roles-config.component';
import {routes} from "./geo-roles-config-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('GeoRolesConfigRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<GeoRolesConfigComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ GeoRolesConfigComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(GeoRolesConfigComponent);
    router.initialNavigation();
  }));
});

