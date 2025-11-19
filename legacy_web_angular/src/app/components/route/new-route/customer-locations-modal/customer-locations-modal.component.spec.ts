import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLocationsModalComponent } from './customer-locations-modal.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('CustomerLocationsModalComponent', () => {
  let component: CustomerLocationsModalComponent;
  let fixture: ComponentFixture<CustomerLocationsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerLocationsModalComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, HttpClientTestingModule],
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
    fixture = TestBed.createComponent(CustomerLocationsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
