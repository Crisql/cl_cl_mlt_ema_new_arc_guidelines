import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressDatailsComponent } from './address-datails.component';
import { ModalModule } from '@clavisco/alerts';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('AddressDatailsComponent', () => {
  let component: AddressDatailsComponent;
  let fixture: ComponentFixture<AddressDatailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressDatailsComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {}},
        { provide: MatDialogRef, useValue: {} }
      ],

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressDatailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
