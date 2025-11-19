import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelPaymentComponent } from './cancel-payment.component';
import {LinkerService} from "@clavisco/linker";
import {OverlayModule} from "@clavisco/overlay";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {MatDialogModule} from "@angular/material/dialog";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('CancelPaymentComponent', () => {
  let component: CancelPaymentComponent;
  let fixture: ComponentFixture<CancelPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelPaymentComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
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
    fixture = TestBed.createComponent(CancelPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
