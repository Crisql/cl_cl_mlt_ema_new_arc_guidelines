import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditReconciliationLineComponent } from './edit-reconciliation-line.component';

describe('EditReconciliationLineComponent', () => {
  let component: EditReconciliationLineComponent;
  let fixture: ComponentFixture<EditReconciliationLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditReconciliationLineComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditReconciliationLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
