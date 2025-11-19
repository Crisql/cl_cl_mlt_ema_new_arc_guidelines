import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CashFlowPage } from './cash-flow.page';

describe('ProductSearchComponent', () => {
  let component: CashFlowPage;
  let fixture: ComponentFixture<CashFlowPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashFlowPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CashFlowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
