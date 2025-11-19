import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BusinessPartnerMasterDataPage } from './business-partner-master-data.page';

describe('BusinessPartnerMasterDataPage', () => {
  let component: BusinessPartnerMasterDataPage;
  let fixture: ComponentFixture<BusinessPartnerMasterDataPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessPartnerMasterDataPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessPartnerMasterDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
