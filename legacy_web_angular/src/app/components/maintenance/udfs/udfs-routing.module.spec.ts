
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UdfsComponent } from './udfs.component';
import {routes} from "./udfs-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('UdfsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<UdfsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ UdfsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(UdfsComponent);
    router.initialNavigation();
  }));
});

