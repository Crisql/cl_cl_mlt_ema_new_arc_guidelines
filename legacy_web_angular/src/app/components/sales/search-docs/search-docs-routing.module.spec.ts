
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchDocsComponent } from './search-docs.component';
import {routes} from "./search-docs-routing.module";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

describe('SearchDocsRoutingModule', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<SearchDocsComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ SearchDocsComponent ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(SearchDocsComponent);
    router.initialNavigation();
  }));
});

