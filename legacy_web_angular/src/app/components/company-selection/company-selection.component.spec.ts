import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySelectionComponent } from './company-selection.component';
import {RouterTestingModule} from "@angular/router/testing";
import {AlertsModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {LinkerService} from "@clavisco/linker";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('CompanySelectionComponent', () => {
  let component: CompanySelectionComponent;
  let fixture: ComponentFixture<CompanySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanySelectionComponent ],
      imports: [OverlayModule, AlertsModule, RouterTestingModule, HttpClientTestingModule],
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
    fixture = TestBed.createComponent(CompanySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
