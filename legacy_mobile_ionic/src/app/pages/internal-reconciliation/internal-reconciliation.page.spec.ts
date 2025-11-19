import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InternalReconciliationPage } from './internal-reconciliation.page';

describe('InternalReconciliationPage', () => {
  let component: InternalReconciliationPage;
  let fixture: ComponentFixture<InternalReconciliationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalReconciliationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InternalReconciliationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
