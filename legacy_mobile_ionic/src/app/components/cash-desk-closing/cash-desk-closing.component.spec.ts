import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CashDeskClosingComponent } from './cash-desk-closing.component';

describe('CashDeskClosingComponent', () => {
  let component: CashDeskClosingComponent;
  let fixture: ComponentFixture<CashDeskClosingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashDeskClosingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CashDeskClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
