import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditInventoryTransferItemComponent } from './edit-inventory-transfer-item.component';

describe('EditInventoryTransferItemComponent', () => {
  let component: EditInventoryTransferItemComponent;
  let fixture: ComponentFixture<EditInventoryTransferItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditInventoryTransferItemComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditInventoryTransferItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
