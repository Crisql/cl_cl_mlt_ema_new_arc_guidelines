import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { EditDocumentLineComponent } from "./edit-document-line.component";

describe("EditDocumentLineComponent", () => {
  let component: EditDocumentLineComponent;
  let fixture: ComponentFixture<EditDocumentLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditDocumentLineComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(EditDocumentLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
