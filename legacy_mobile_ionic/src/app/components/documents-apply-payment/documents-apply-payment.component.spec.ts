import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { DocumentsApplyPayment } from "./documents-apply-payment.component";

describe("DocumentsApplyPaymentComponent", () => {
  let component: DocumentsApplyPayment;
  let fixture: ComponentFixture<DocumentsApplyPayment>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentsApplyPayment],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsApplyPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
