import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTerminalsComponent } from './add-terminals.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {RouterTestingModule} from "@angular/router/testing";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('AddTerminalsComponent', () => {
  let component: AddTerminalsComponent;
  let fixture: ComponentFixture<AddTerminalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTerminalsComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {}},
        { provide: MatDialogRef, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTerminalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
