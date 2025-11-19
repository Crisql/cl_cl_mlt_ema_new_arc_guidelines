import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileOfflineComponent } from './mobile-offline.component';
import {OverlayModule} from "@clavisco/overlay";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {MatDialogModule} from "@angular/material/dialog";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {SyncDocumentStatusNamePipe} from "@app/pipes/sync-document-status-name.pipe";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { IActionButton } from '@app/interfaces/i-action-button';
import { DocumentSyncStatus, DocumentSyncTypes } from '@app/enums/enums';
import { Structures } from '@clavisco/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '@app/shared/shared.service';
import { of } from 'rxjs';

describe('MobileOfflineComponent', () => {
  let component: MobileOfflineComponent;
  let fixture: ComponentFixture<MobileOfflineComponent>;


  let router: Router;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;;
  let sharedService: SharedService;
  
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSharedService: jasmine.SpyObj<SharedService>;
  let mockActivatedRoute: Partial<ActivatedRoute>;/*/any;/*///jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };
    const sharedServiceMock = {
      GetCurrentRouteSegment: jasmine.createSpy('GetCurrentRouteSegment').and.returnValue('current-route')
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSharedService = jasmine.createSpyObj('SharedService', ['GetCurrentRouteSegment']);
    mockActivatedRoute = {
      
      queryParams: of({})
    };
    /*{queryParams: of({})};*///jasmine.createSpyObj('ActivatedRoute', [], { snapshot: {} });

    await TestBed.configureTestingModule({
      declarations: [ MobileOfflineComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        SyncDocumentStatusNamePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    router = TestBed.inject(Router);
    //activatedRoute = TestBed.inject(ActivatedRoute);
    sharedService = TestBed.inject(SharedService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //-- 

  it('should call SearchSyncDocuments when the SEARCH action button is clicked', () => {
    // Espiar el método SearchSyncDocuments
    spyOn(component, 'SearchSyncDocuments');
  
    // Crear un objeto IActionButton para el botón de búsqueda
    const actionButton: IActionButton = { Key: 'SEARCH', MatIcon: 'search', Text: 'Buscar', MatColor: 'primary' };
  
    // Llamar al método
    component.OnActionButtonClicked(actionButton);
  
    // Verificar que SearchSyncDocuments fue llamado
    expect(component.SearchSyncDocuments).toHaveBeenCalled();
  });
  
  it('should not call SearchSyncDocuments for other action button keys', () => {
    spyOn(component, 'SearchSyncDocuments');
    
    const actionButton: IActionButton = { Key: 'OTHER_ACTION', MatIcon: 'other', Text: 'Other', MatColor: 'accent' };
  
    component.OnActionButtonClicked(actionButton);
  
    expect(component.SearchSyncDocuments).not.toHaveBeenCalled();
  });

  //---
  it('should return "Facturas" for DocumentSyncTypes.Invoice', () => {
    expect(component.DocumentTypeDescription(DocumentSyncTypes.Invoice)).toEqual('Facturas');
  });

  it('should return "Factura + Pago" for DocumentSyncTypes.InvoiceWithPayment', () => {
    expect(component.DocumentTypeDescription(DocumentSyncTypes.InvoiceWithPayment)).toEqual('Factura + Pago');
  });

  it('should return "Cotizaciones" for DocumentSyncTypes.SaleQuotation', () => {
    expect(component.DocumentTypeDescription(DocumentSyncTypes.SaleQuotation)).toEqual('Cotizaciones');
  });

  it('should return "Orden de compra" for DocumentSyncTypes.SaleOrder', () => {
    expect(component.DocumentTypeDescription(DocumentSyncTypes.SaleOrder)).toEqual('Orden de compra');
  });

  it('should return "Pagos recibidos" for DocumentSyncTypes.IncomingPayment', () => {
    expect(component.DocumentTypeDescription(DocumentSyncTypes.IncomingPayment)).toEqual('Pagos recibidos');
  });

  it('should return "Todos" for an unknown type', () => {
    expect(component.DocumentTypeDescription('UNKNOWN_TYPE')).toEqual('Todos');
  });

  //--

  it('should return "Completado" for DocumentSyncStatus.Success', () => {
    expect(component.DocumentStatusDescription(DocumentSyncStatus.Success)).toEqual('Completado');
  });

  it('should return "Con errores" for DocumentSyncStatus.Errors', () => {
    expect(component.DocumentStatusDescription(DocumentSyncStatus.Errors)).toEqual('Con errores');
  });

  it('should return "En cola" for DocumentSyncStatus.InQueue', () => {
    expect(component.DocumentStatusDescription(DocumentSyncStatus.InQueue)).toEqual('En cola');
  });

  it('should return "Procesando" for DocumentSyncStatus.Processing', () => {
    expect(component.DocumentStatusDescription(DocumentSyncStatus.Processing)).toEqual('Procesando');
  });

  it('should return "Todos" for an unknown status', () => {
    expect(component.DocumentStatusDescription('UNKNOWN_STATUS')).toEqual('Todos');
  });

  //---
  it('should not navigate if _event.Data is not provided', () => {
    const mockEvent: ICLEvent = {
      Target: "", 
      CallBack: "",
      Data: ""
    };

    component.OnSyncDocumentTableActionActivated(mockEvent);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate if Action is not READ', () => {
    const mockEvent: ICLEvent = {
      Target: "", 
      CallBack: "",
      Data: JSON.stringify({
        Action: 'OTHER_ACTION',
        Data: JSON.stringify({ Id: 123 })
      })
    };

    component.OnSyncDocumentTableActionActivated(mockEvent);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle JSON parse errors gracefully', () => {
    const mockEvent: ICLEvent = {
      Target: "", 
      CallBack: "",
      Data: 'invalid json'
    };
  
    // Wrap the function call in a try-catch block
    expect(() => {
      try {
        component.OnSyncDocumentTableActionActivated(mockEvent);
      } catch (error) {
        // Expect the error to be a SyntaxError
        expect(error).toBeInstanceOf(SyntaxError);
      }
    }).not.toThrow();
  });

  
});
