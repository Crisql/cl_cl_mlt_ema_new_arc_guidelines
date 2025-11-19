import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PrintReportPage } from './print-report.page';

describe('PrintReportPage', () => {
  let component: PrintReportPage;
  let fixture: ComponentFixture<PrintReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
