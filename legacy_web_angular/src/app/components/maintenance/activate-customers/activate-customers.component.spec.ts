import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateCustomersComponent } from './activate-customers.component';
import {CL_CHANNEL, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { Structures } from '@clavisco/core/structures';
import {IActionButton} from "@app/interfaces/i-action-button";

describe('ActivateCustomersComponent', () => {
  let component: ActivateCustomersComponent;
  let fixture: ComponentFixture<ActivateCustomersComponent>;
  let linkerService: LinkerService;

  beforeEach(async () => {
    linkerService = jasmine.createSpyObj('LinkerService', ['Publish']);

    await TestBed.configureTestingModule({
      declarations: [ ActivateCustomersComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    linkerService = TestBed.inject(LinkerService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call linkerService.Publish on SEARCH action', () => {
    const publishSpy = spyOn(linkerService, 'Publish');
  
    const actionButton: IActionButton = { Key: 'SEARCH' };
    component.businessPartnerTableId = 'some-table-id'; // BUSINESSPARTNER-TABLE
  
    component.OnActionButtonClicked(actionButton);
  
    expect(publishSpy).toHaveBeenCalledWith({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: 'some-table-id',
      Data: ''
    });
  });

  it('should call Clear on CLEAN action', () => {
    const clearSpy = spyOn(component, 'Clear');

    const actionButton: IActionButton = { Key: 'CLEAN' };
    
    component.OnActionButtonClicked(actionButton);
    
    expect(clearSpy).toHaveBeenCalled();
  });

  
 
});
