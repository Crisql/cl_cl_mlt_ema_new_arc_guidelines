
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginContainerComponent } from './login-container.component';
import {routes} from "./login-container-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('LoginContainerRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<LoginContainerComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ LoginContainerComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(LoginContainerComponent);
    router.initialNavigation();
  }));
});

