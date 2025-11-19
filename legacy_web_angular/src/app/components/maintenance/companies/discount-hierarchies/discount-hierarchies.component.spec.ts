import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountHierarchiesComponent } from './discount-hierarchies.component';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('DiscountHierarchiesComponent', () => {
  let component: DiscountHierarchiesComponent;
  let fixture: ComponentFixture<DiscountHierarchiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountHierarchiesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountHierarchiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
