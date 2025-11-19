import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDocsComponent } from './search-docs.component';
import {LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTooltipModule} from "@angular/material/tooltip";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('SearchDocsComponent', () => {
  let component: SearchDocsComponent;
  let fixture: ComponentFixture<SearchDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchDocsComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule, MatAutocompleteModule, MatTooltipModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
