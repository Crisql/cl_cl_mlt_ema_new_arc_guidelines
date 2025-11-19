
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InternalReconciliationComponent } from './internal-reconciliation.component';
import { RouterTestingModule } from '@angular/router/testing';
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {LinkerService} from "@clavisco/linker";

describe('InternalReconciliationRoutingModule', () => {
  let component: InternalReconciliationComponent
  let fixture: ComponentFixture<InternalReconciliationComponent>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [ InternalReconciliationComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: 'LinkerService', useExisting: LinkerService }
      ]
    }).compileComponents()
  });
});

