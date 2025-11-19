import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesEditComponent } from './series-edit.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {LinkerService} from "@clavisco/linker";
import {RouterTestingModule} from "@angular/router/testing";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('SeriesEditComponent', () => {
  let component: SeriesEditComponent;
  let fixture: ComponentFixture<SeriesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeriesEditComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, HttpClientTestingModule, RouterTestingModule, MatAutocompleteModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        { provide: MAT_DIALOG_DATA, useValue: {}},
        { provide: MatDialogRef, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
