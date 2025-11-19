import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPrinterComponent } from './local-printer.component';
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule} from "@clavisco/alerts";
import {RouterTestingModule} from "@angular/router/testing";
import {OverlayModule} from "@clavisco/overlay";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {LinkerService} from "@clavisco/linker";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('LocalPrinterComponent', () => {
  let component: LocalPrinterComponent;
  let fixture: ComponentFixture<LocalPrinterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalPrinterComponent ],
      imports: [OverlayModule, AlertsModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
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
    fixture = TestBed.createComponent(LocalPrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
