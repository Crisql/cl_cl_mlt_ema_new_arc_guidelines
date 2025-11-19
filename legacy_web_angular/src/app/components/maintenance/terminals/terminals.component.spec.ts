import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalsComponent } from './terminals.component';
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, AlertsService, CLToastType, ModalModule} from "@clavisco/alerts";
import {OverlayModule, OverlayService} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { ITerminals, ITerminalsByUser } from '@app/interfaces/i-terminals';
import { ICurrencies } from '@app/interfaces/i-currencies';
import { IRowByEvent } from '@clavisco/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '@app/shared/shared.service';
import { IActionButton } from '@app/interfaces/i-action-button';
import { of } from 'rxjs';

describe('TerminalsComponent', () => {
  let component: TerminalsComponent;
  let fixture: ComponentFixture<TerminalsComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSharedService: jasmine.SpyObj<SharedService>;
  let router: Router;

  let alertsService: jasmine.SpyObj<AlertsService>;

  beforeEach(async () => {   
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSharedService = jasmine.createSpyObj('SharedService', ['GetCurrentRouteSegment', 'loadInitialData']);
    alertsService = jasmine.createSpyObj('AlertsService', ['Toast']);

   
    await TestBed.configureTestingModule({
      declarations: [ TerminalsComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule.withRoutes([
        { path: 'maintenance/terminals', component: TerminalsComponent },
        { path: 'maintenance/terminals/terms-by-users', component: TerminalsComponent }
      ]), HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        { provide: AlertsService, useValue: alertsService }

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalsComponent);
    component = fixture.componentInstance; 
    router = TestBed.inject(Router);

    spyOn(router, 'navigate');
    component.terminals = [
      { Currency: 'USD', Default: false, Assigned: false } as ITerminals,
      { Currency: 'COL', Default: false, Assigned: false } as ITerminals,
      { Currency: 'EUR', Default: false, Assigned: false } as ITerminals
    ]; 
    component.localCurrency = { Id: 'COL' } as ICurrencies ;  


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should log an error and return if selectedRowIndex is out of range', () => {
    spyOn(console, 'error');
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: -1,
        CurrentPage: 0,
        Row: {}
      })
    };

    component.EventColumn(event);

    expect(console.error).toHaveBeenCalledWith('Índice seleccionado fuera de rango:', -1);
  });

  it('should not mark as default if Row.Assigned is undefined', () => {
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Currency: 'USD' }
      })
    };

    component.EventColumn(event);

    expect(component.terminals[0].Default).toBeFalse();
    expect(component.terminals[0].Assigned).toBeFalse();
  });

  it('should update default currency when Row.Assigned is true and Currency is different from localCurrency.Id', () => {
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: true, Currency: 'USD' }
      })
    };

    component.terminals[0].Assigned = true;
    component.terminals[0].Default = true;

    component.EventColumn(event);

    expect(component.terminals[0].Default).toBeFalse();
  });

  it('should set terminal as default if Currency matches localCurrency.Id', () => {
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 1,
        CurrentPage: 0,
        Row: { Assigned: true, Currency: 'COL' }
      })
    };

    component.terminals[1].Assigned = true;
    component.terminals[1].Default = true;

    component.EventColumn(event);

    expect(component.terminals[1].Default).toBeFalse();
  });

  it('should unassign and reset default if Row.Assigned is false', () => {
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 1,
        CurrentPage: 0,
        Row: { Assigned: false, Currency: 'COL' }
      })
    };

    component.terminals[1].Assigned = true;
    component.terminals[1].Default = true;

    component.EventColumn(event);

    expect(component.terminals[1].Assigned).toBeFalse();
    expect(component.terminals[1].Default).toBeFalse();
  });

  it('should call InflateTableTerminalsByUser after processing', () => {
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: true, Currency: 'USD' }
      })
    };

    spyOn(component, 'InflateTableTerminalsByUser');

    component.EventColumn(event);

    expect(component.InflateTableTerminalsByUser).toHaveBeenCalled();
  });

  //----
  it('should call addTerminalUser when newTerminal is called with "ADD_TERMINAL_BY_USER"', () => {
    spyOn(component, 'addTerminalUser');

    const actionEvent: IActionButton = { Key: 'ADD_TERMINAL_BY_USER' };

    component.newTerminal(actionEvent);

    expect(component.addTerminalUser).toHaveBeenCalled();
  });

  it('should call InflateTableTerminalsByUser after processing', () => {
    const event: ICLEvent = {
      Target: '',
      CallBack: '',
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: true, Currency: 'USD' }
      })
    };

    spyOn(component, 'InflateTableTerminalsByUser');

    component.EventColumn(event);

    expect(component.InflateTableTerminalsByUser).toHaveBeenCalled();
  });

  //----
  it('should navigate to "/maintenance/terminals" when tab index is 0', () => {
    component.tabChanged(0);
    expect(router.navigate).toHaveBeenCalledWith(['/maintenance', 'terminals']);
  });

  it('should navigate to "/maintenance/terminals/terms-by-users" when tab index is 1', () => {
    component.tabChanged(1);
    expect(router.navigate).toHaveBeenCalledWith(['/maintenance', 'terminals', 'terms-by-users']);
  });

  it('should not navigate if the tab index is not 0 or 1', () => {
    component.tabChanged(2);
    expect(router.navigate).not.toHaveBeenCalled();
  });
  

  //----
  it('should create terminal user data when the form is valid', () => {
    component.frmTermsByUser.controls['UserId'].setValue(1);
    component.frmTermsByUser.controls['CompanyId'].setValue(1);

    component.terminals = [
      { Id: 1, Assigned: true, Default: true, Currency: 'USD' } as ITerminals,
      { Id: 2, Assigned: false, Default: true, Currency: 'COL' } as ITerminals,
      { Id: 3, Assigned: true, Default: false, Currency: 'USD' } as ITerminals,
      { Id: 4, Assigned: true, Default: false, Currency: 'COL' } as ITerminals,
    ];
    component.localCurrency = { Id: 'COL' } as ICurrencies;

    component.addTerminalUser();

    const expectedTerminalUser = {
      UserId: 1,
      CompanyId: 1,
      TerminalsByUser: [
        { UserId: 0, TerminalId: 1, CompanyId: 0 } as ITerminalsByUser, 
        { UserId: 0, TerminalId: 3, CompanyId: 0 } as ITerminalsByUser, 
        { UserId: 0, TerminalId: 4, CompanyId: 0 } as ITerminalsByUser, 
      ],
      TerminalDefaultCOL: 2,
      TerminalDefaultUSD: 1,
    };

    expect(component.terminalsByUser).toEqual(expectedTerminalUser.TerminalsByUser);
    
    expect(component.terminals.find(x => x.Default && x.Currency === component.localCurrency.Id)?.Id).toBe(expectedTerminalUser.TerminalDefaultCOL);
    expect(component.terminals.find(x => x.Default && x.Currency !== component.localCurrency.Id)?.Id).toBe(expectedTerminalUser.TerminalDefaultUSD);
});


  it('should show alert if the form is invalid', () => {
    component.frmTermsByUser.controls['UserId'].setValue(null);
    component.frmTermsByUser.controls['CompanyId'].setValue(null);

    component.addTerminalUser();

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'Verfique que haya seleccionado el usuario y compañía.'
    });
  });
});
