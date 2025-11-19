import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteHistoryComponent } from './route-history.component';
import {OverlayModule} from "@clavisco/overlay";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('RouteHistoryComponent', () => {
  let component: RouteHistoryComponent;
  let fixture: ComponentFixture<RouteHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteHistoryComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, HttpClientTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {}},
        { provide: MatDialogRef, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
