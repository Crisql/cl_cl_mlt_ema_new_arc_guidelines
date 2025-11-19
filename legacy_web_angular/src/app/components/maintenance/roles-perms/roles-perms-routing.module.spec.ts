
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesPermsComponent } from './roles-perms.component';
import {routes} from "./roles-perms-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('RolesPermsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<RolesPermsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ RolesPermsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(RolesPermsComponent);
    router.initialNavigation();
  }));
});

