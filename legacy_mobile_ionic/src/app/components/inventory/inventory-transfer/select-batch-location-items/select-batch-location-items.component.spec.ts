import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectBatchLocationItemsComponent } from './select-batch-location-items.component';

describe('SelectBatchLocationItemsComponent', () => {
  let component: SelectBatchLocationItemsComponent;
  let fixture: ComponentFixture<SelectBatchLocationItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectBatchLocationItemsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectBatchLocationItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
