import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { OutgoingPaymentComponent } from './outgoing-payment.component';
import {CL_CHANNEL, ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, AlertsService, CLToastType, ModalModule, ModalService} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { IActionButton } from '@app/interfaces/i-action-button';
import { ICurrentSession } from '@app/interfaces/i-localStorage';
import { InvoiceOpen } from '@app/interfaces/i-invoice-payment';
import {
  CLTofixed,
  CurrentDate,
  FormatDate,
  GetIndexOnPagedTable,
  MappingUdfsDevelopment
} from "@app/shared/common-functions";
import { ICurrencies } from '@app/interfaces/i-currencies';
import { ACCOUNT_TYPE, IPaymentHolder, ITransaction } from '@clavisco/payment-modal';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ISettings } from '@app/interfaces/i-settings';
import { ICompany } from '@app/interfaces/i-company';
describe('OutgoingPaymentComponent', () => {
  let component: OutgoingPaymentComponent;
  let fixture: ComponentFixture<OutgoingPaymentComponent>;
  let modalServiceSpy: jasmine.SpyObj<ModalService>;
  let formBuilder: FormBuilder;
  let linkerService: LinkerService;
  let alertsService: jasmine.SpyObj<AlertsService>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('ModalService', ['NextError']);
    const alertsServiceSpy = jasmine.createSpyObj('AlertsService', ['Toast']);

    await TestBed.configureTestingModule({
      declarations: [ OutgoingPaymentComponent ],
      imports: [NoopAnimationsModule,OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: AlertsService, useValue: alertsServiceSpy }

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutgoingPaymentComponent);
    component = fixture.componentInstance;

    component.currentSession = { Rate: 2 } as ICurrentSession;
    
    formBuilder = TestBed.inject(FormBuilder);

    linkerService = TestBed.inject(LinkerService);

    alertsService = TestBed.inject(AlertsService) as jasmine.SpyObj<AlertsService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a SearchDocuments cuando el Key es "SEARCH"', () => {
    const actionButton: IActionButton = { Key: 'SEARCH' };

    const searchDocumentsSpy = spyOn<any>(component, 'SearchDocuments' as any);
    component.OnActionButtonClicked(actionButton);

    expect(searchDocumentsSpy).toHaveBeenCalled();
  });

  it('debería llamar a OpenPaymentModal cuando el Key es "G-PAGO"', () => {
    const actionButton: IActionButton = { Key: 'G-PAGO' };

    spyOn(component, 'OpenPaymentModal');
    component.OnActionButtonClicked(actionButton);

    expect(component.OpenPaymentModal).toHaveBeenCalled();
  });

  it('debería llamar a Clear cuando el Key es "CLEAN"', () => {
    const actionButton: IActionButton = { Key: 'CLEAN' };

    const clearSpy = spyOn<any>(component, 'Clear' as any);
    component.OnActionButtonClicked(actionButton);

    expect(clearSpy).toHaveBeenCalled();
  });

  it('no debería llamar a ningún método si el Key no coincide con ningún caso', () => {
    const actionButton: IActionButton = { Key: 'UNKNOWN' };

    const searchDocumentsSpy = spyOn<any>(component, 'SearchDocuments' as any);
    const clearSpy = spyOn<any>(component, 'Clear' as any);
    spyOn(component, 'OpenPaymentModal');

    component.OnActionButtonClicked(actionButton);

    expect(searchDocumentsSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(component.OpenPaymentModal).not.toHaveBeenCalled();
  });

  //----
  it('debería asignar el valor de Assigned y llamar a InflateTable cuando el evento es "InputField" y Pago es <= 0', () => {
    component.documents = [
      { Assigned: false, Pago: 0, Saldo: 100, DocCurrency: 'USD' } as InvoiceOpen, 
    ];

    spyOn<any>(component, 'GetTotalByCurrency').and.callFake((pago: number, currency: string) => pago); 
  
    const mockEvent: ICLEvent = {
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: true, Pago: '0', Saldo: 100 },
        EventName: 'InputField'
      }),
      Target: '',
      CallBack: ''
    };

    const inflateTableSpy = spyOn<any>(component, 'InflateTable' as any);

    component.OnTableItemSelectionActivated(mockEvent);

    expect(component.documents[0].Assigned).toBe(true);
    expect(inflateTableSpy).toHaveBeenCalled();
  });

  it('debería asignar el valor de Pago del Row cuando el evento es "InputField" y Pago es > 0', () => {
    component.documents = [
      { Assigned: false, Pago: 0, Saldo: 100, DocCurrency: 'USD' } as InvoiceOpen
    ];

    component.currentSession = {
      Rate: 2 
    } as ICurrentSession;
    
    spyOn<any>(component, 'GetTotalByCurrency').and.callFake((pago: number, currency: string) => pago); 
  
    const mockEvent: ICLEvent = {
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: true, Pago: 50, Saldo: 100 },
        EventName: 'InputField'
      }),
      Target: '',
      CallBack: ''
    };

    const inflateTableSpy = spyOn<any>(component, 'InflateTable' as any);

    component.OnTableItemSelectionActivated(mockEvent);

    expect(component.documents[0].Pago).toBe(50);
    expect(inflateTableSpy).toHaveBeenCalled();
  });

  it('debería asignar el valor de Pago basado en Assigned cuando el evento no es "InputField"', () => {
    component.documents = [
      { Assigned: false, Pago: 0, Saldo: 100, DocCurrency: 'USD' } as InvoiceOpen  
     ];
    component.currentSession = {
      Rate: 2  
    } as ICurrentSession;
    spyOn<any>(component, 'GetTotalByCurrency').and.callFake((pago: number, currency: string) => pago); 
  
    const mockEvent: ICLEvent = {
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: true, Pago: '50', Saldo: 100 },
        EventName: 'OtherEvent'
      }),
      Target: '',
      CallBack: ''
    };

    const inflateTableSpy = spyOn<any>(component, 'InflateTable' as any);

    component.OnTableItemSelectionActivated(mockEvent);

    expect(component.documents[0].Pago).toBe(100);  
    expect(inflateTableSpy).toHaveBeenCalled();
  });

  it('debería asignar Pago a 0 cuando el evento no es "InputField" y Assigned es false', () => {
    component.documents = [
      { Assigned: false, Pago: 0, Saldo: 100, DocCurrency: 'USD' } as InvoiceOpen,  
    ];
    component.currentSession = {
      Rate: 2 
    } as ICurrentSession;

    spyOn<any>(component, 'GetTotalByCurrency').and.callFake((pago: number, currency: string) => pago); 
  
    const mockEvent: ICLEvent = {
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: false, Pago: '50', Saldo: 100 },
        EventName: 'OtherEvent'
      }),
      Target: '',
      CallBack: ''
    };

    const inflateTableSpy = spyOn<any>(component, 'InflateTable' as any);

    component.OnTableItemSelectionActivated(mockEvent);

    expect(component.documents[0].Pago).toBe(0); 
    expect(inflateTableSpy).toHaveBeenCalled();
  });

  it('debería calcular total y totalFC correctamente', () => {
    component.documents = [
      { Assigned: false, Pago: 0, Saldo: 100, DocCurrency: 'USD' } as InvoiceOpen, 
    ];

    spyOn<any>(component, 'GetTotalByCurrency').and.callFake((pago: number, currency: string) => pago); 
  
    const mockEvent: ICLEvent = {
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Assigned: true, Pago: '50', Saldo: 100 },
        EventName: 'InputField'
      }),
      Target: '',
      CallBack: ''
    };

    component.currentSession = { Rate: 2 } as ICurrentSession;

    const inflateTableSpy = spyOn<any>(component, 'InflateTable' as any);

    component.OnTableItemSelectionActivated(mockEvent);
    component.total = 50;
    expect(component.total).toBe(50);
    expect(component.totalFC).toBe(25); 
    expect(inflateTableSpy).toHaveBeenCalled();
  });

  //----
  it('debería retornar el valor de _pay si _currency es igual a localCurrency.Id', () => {
    component.currentSession = {
      Rate: 20 
    } as ICurrentSession;
    component.localCurrency = { Id: 'USD' } as ICurrencies;

    const _pay = 100;
    const _currency = 'USD'; 

    const result = component['GetTotalByCurrency'](_pay, _currency);

    expect(result).toBe(_pay); 
  });

  it('debería retornar el valor de _pay multiplicado por el rate si _currency es diferente a localCurrency.Id', () => {
    
    component.currentSession = {
      Rate: 20 
    } as ICurrentSession;
    component.localCurrency = { Id: 'USD' } as ICurrencies;

    const _pay = 100;
    const _currency = 'EUR'; 

    const result = component['GetTotalByCurrency'](_pay, _currency);

    expect(result).toBe(_pay * component.currentSession.Rate); 
  });

  //----
  it('should assign PaymentState and call CreateOutingPayment when data.Result is true', () => {
    component.paymentHolder = {} as IPaymentHolder;
    component.currentSession = { Rate: 100 } as ICurrentSession ;
    const data = { Result: true, PaymentState: 'Paid' };
    const event = { Data: JSON.stringify(data) } as ICLEvent;
    spyOn(component, 'CreateOutingPayment');

    component.HandlePaymentModalResult(event);

    expect(component.paymentHolder.PaymentState).toEqual('Paid' as any);
    expect(component.CreateOutingPayment).toHaveBeenCalledWith('Paid' as any, component.currentSession!.Rate);
  });

  it('should call modalService.NextError and reset paymentHolder when data.Result is false and message is provided', fakeAsync(() => {
    const data = { Result: false, Message: 'Error occurred' };
    const event = { Data: JSON.stringify(data) } as ICLEvent;
  
    component.HandlePaymentModalResult(event);
    tick(); 
  
    expect(modalServiceSpy.NextError).toHaveBeenCalledWith({ subtitle: 'Error occurred', disableClose: true });
    expect(component.paymentHolder).toEqual({} as IPaymentHolder);
  }));
  
  it('should reset paymentHolder when data.Result is false and no message is provided', () => {
    component.paymentHolder = {} as IPaymentHolder;
    component.currentSession = { Rate: 100 } as ICurrentSession ;
    const data = { Result: false };
    const event = { Data: JSON.stringify(data) } as ICLEvent;

    component.HandlePaymentModalResult(event);

    expect(modalServiceSpy.NextError).not.toHaveBeenCalled();
    expect(component.paymentHolder).toEqual({} as IPaymentHolder);
  });
  
  //----
  it('should call SetTotalPayAccount when IsPayAccount is true', () => {
    component.documentForm = formBuilder.group({
      IsPayAccount: [false]
    });
    spyOn(component, 'SetTotalPayAccount');
    component.documentForm.controls['IsPayAccount'].setValue(true);
    
    component.SelectCurrency();
    
    expect(component.SetTotalPayAccount).toHaveBeenCalled();
  });

  it('should reset documents and totals when IsPayAccount is false', () => {
    component.documentForm = formBuilder.group({
      IsPayAccount: [false]
    });
    component.documents = [{ DocEntry: 1, CardName: 'Sample' } as InvoiceOpen];
    component.total = 100;
    component.totalFC = 200;
    
    component.documentForm.controls['IsPayAccount'].setValue(false);
    
    component.SelectCurrency();
    
    expect(component.documents).toEqual([]);
    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);

  });

  //----
  it('should call GetConfiguredUdfs when isVisible is true', () => {
    spyOn(component, 'GetConfiguredUdfs');

    component.isVisible = true;

    component.OpenPaymentModal();

    expect(component.GetConfiguredUdfs).toHaveBeenCalled();
  });

  it('should call SaveChanges when isVisible is false', () => {
    const saveChangesSpy = spyOn<any>(component, 'SaveChanges');

    component.isVisible = false;

    component.OpenPaymentModal();

    expect(saveChangesSpy).toHaveBeenCalled();
  });

  //----
  it('should return ACCOUNT_TYPE.CASH when _type is 1', () => {
    const result = component.MapAccountType(1);
    expect(result).toBe(ACCOUNT_TYPE.CASH);
  });

  it('should return ACCOUNT_TYPE.CARD when _type is 2', () => {
    const result = component.MapAccountType(2);
    expect(result).toBe(ACCOUNT_TYPE.CARD);
  });

  it('should return ACCOUNT_TYPE.TRANSFER when _type is 3', () => {
    const result = component.MapAccountType(3);
    expect(result).toBe(ACCOUNT_TYPE.TRANSFER);
  });

  it('should return an empty string when _type is not 1, 2, or 3', () => {
    const result = component.MapAccountType(99);
    expect(result).toBe('');
  });

  //----
  it('should call linkerService.Publish when isVisible is true', () => {
    component.UdfsId = 'TestUdfsId';

    component.isVisible = true;

    const cleanFieldsSpy = spyOn<any>(component, 'CleanFields').and.callThrough();

    const publishSpy = spyOn(linkerService, 'Publish');

    (component as any).CleanFields();

    expect(cleanFieldsSpy).toHaveBeenCalled();

    expect(publishSpy).toHaveBeenCalledWith({
      Target: 'TestUdfsId',
      Data: '',
      CallBack: CL_CHANNEL.RESET
    });
  });

  it('should not call linkerService.Publish when isVisible is false', () => {
    component.UdfsId = 'TestUdfsId';

    component.isVisible = false;

    const publishSpy = spyOn(linkerService, 'Publish');

    (component as any).CleanFields();

    expect(publishSpy).not.toHaveBeenCalled();
  });

  //----
  it('should return the amount multiplied by the rate when _currency matches localCurrency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.5 }as ICurrentSession ; 
    component.DecimalTotalDocument = 2;
    const currency = 'USD';
    const amount = 100;

    const displayChangeAmountSpy = spyOn<any>(component, 'DisplayChangeAmount').and.callThrough();

    const result = (component as any).DisplayChangeAmount(currency, amount);

    expect(displayChangeAmountSpy).toHaveBeenCalledWith(currency, amount);

    expect(result).toBe(150.00); 
  });

  it('should return the amount divided by the rate when _currency does not match localCurrency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.5 }as ICurrentSession ; 
    component.DecimalTotalDocument = 2;
    const currency = 'EUR';
    const amount = 100;

    const displayChangeAmountSpy = spyOn<any>(component, 'DisplayChangeAmount').and.callThrough();

    const result = (component as any).DisplayChangeAmount(currency, amount);

    expect(displayChangeAmountSpy).toHaveBeenCalledWith(currency, amount);

    expect(result).toBe(66.67); 
  });

  it('should handle zero amount correctly', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.5 }as ICurrentSession ; 
    component.DecimalTotalDocument = 2;
    const currency = 'USD';
    const amount = 0;

    const result = (component as any).DisplayChangeAmount(currency, amount);

    expect(result).toBe(0.00);
  });

  it('should handle a very high rate correctly', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.5 }as ICurrentSession ; 
    component.DecimalTotalDocument = 2;
    const currency = 'USD';
    const amount = 100;
    component.currentSession.Rate = 1000; 

    const result = (component as any).DisplayChangeAmount(currency, amount);

    expect(result).toBe(100000.00); 
  });

  it('should handle a very low rate correctly', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.5 }as ICurrentSession ;
    component.DecimalTotalDocument = 2;

    const currency = 'EUR';
    const amount = 100;
    component.currentSession.Rate = 0.5; 

    const result = (component as any).DisplayChangeAmount(currency, amount);

    expect(result).toBe(200.00); 
  });

  //----
  it('should enable Amount control when IsPayAccount is true', () => {
    component.documentForm = new FormGroup({
      IsPayAccount: new FormControl(false),
      Amount: new FormControl({ value: 0, disabled: true })
    });
    component.documentForm.controls['IsPayAccount'].setValue(true);

    component.SelectAccountPayment();

    expect(component.documentForm.controls['Amount'].enabled).toBeTrue();
    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
    expect(component.documents).toEqual([]);
  });

  it('should set Amount to 0 and disable control when IsPayAccount is false', () => {
    component.documentForm = new FormGroup({
      IsPayAccount: new FormControl(false),
      Amount: new FormControl({ value: 0, disabled: true })
    });
    component.documentForm.controls['IsPayAccount'].setValue(false);

    component.SelectAccountPayment();

    expect(component.documentForm.controls['Amount'].value).toBe(0);
    expect(component.documentForm.controls['Amount'].enabled).toBeFalse();
    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
    expect(component.documents).toEqual([]);
  });

  it('should reset total, totalFC, and documents regardless of IsPayAccount', () => {
    component.documentForm = new FormGroup({
      IsPayAccount: new FormControl(false),
      Amount: new FormControl({ value: 0, disabled: true })
    });
    component.documentForm.controls['IsPayAccount'].setValue(true);
    component.SelectAccountPayment();
    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
    expect(component.documents).toEqual([]);

    component.documentForm.controls['IsPayAccount'].setValue(false);
    component.SelectAccountPayment();
    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
    expect(component.documents).toEqual([]);
  });

  //----
  it('should set editableFieldConf with permissions and columns', () => {
    component.permissions = [{ Name: 'edit' }, { Name: 'delete' }];
    component.editableField = ['Column1', 'Column2'] as any;
    component.selectedCompany = { Id: 1 } as ICompany;
    component.settings = [
      {
        Code: 'Decimal',
        Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }])
      } as ISettings,
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      }as ISettings
    ];
    component.docTbMapDisplayColumnsArgs = { editableFieldConf: {} };
    component.settings = [
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      } as ISettings
    ];
    (component as any).SetInitialData();

    expect(component.editableFieldConf).toEqual({
      Permissions: component.permissions,
      Condition: jasmine.any(Function),
      Columns: component.editableField
    });

    expect(component.docTbMapDisplayColumnsArgs.editableFieldConf).toEqual(component.editableFieldConf);
  });

  it('should set DecimalTotalDocument and TO_FIXED_TOTALDOCUMENT correctly', () => {
    component.permissions = [{ Name: 'edit' }, { Name: 'delete' }];
    component.editableField = ['Column1', 'Column2'] as any;
    component.selectedCompany = { Id: 1 } as ICompany;
    component.settings = [
      {
        Code: 'Decimal',
        Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }])
      } as ISettings,
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      }as ISettings
    ];
    component.docTbMapDisplayColumnsArgs = { editableFieldConf: {} };
    component.settings = [
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      } as ISettings
    ];
    (component as any).SetInitialData();

    expect(component.DecimalTotalDocument).toBe(0);
    expect(component.TO_FIXED_TOTALDOCUMENT).toBe('1.0-0');
  });

  it('should set paymentConfiguration if payment settings are available', () => {
    component.permissions = [{ Name: 'edit' }, { Name: 'delete' }];
    component.editableField = ['Column1', 'Column2'] as any;
    component.selectedCompany = { Id: 1 } as ICompany;
    component.settings = [
      {
        Code: 'Decimal',
        Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }])
      } as ISettings,
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      }as ISettings
    ];
    component.docTbMapDisplayColumnsArgs = { editableFieldConf: {} };
    component.settings = [
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      } as ISettings
    ];
    (component as any).SetInitialData();

    expect(component.paymentConfiguration).toEqual({ CompanyId: 1, Config: 'SomePaymentConfig' }as any);
  });

  it('should not set paymentConfiguration if payment settings are not available', () => {
    component.permissions = [{ Name: 'edit' }, { Name: 'delete' }];
    component.editableField = ['Column1', 'Column2'] as any;
    component.selectedCompany = { Id: 1 } as ICompany;
    component.settings = [
      {
        Code: 'Decimal',
        Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }])
      } as ISettings,
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      }as ISettings
    ];
    component.docTbMapDisplayColumnsArgs = { editableFieldConf: {} };
    component.settings = [
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      } as ISettings
    ];
    component.settings = [
      {
        Code: 'Decimal',
        Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }])
      } as ISettings
    ];

    (component as any).SetInitialData();

    expect(component.paymentConfiguration).toBeUndefined();
  });

  it('should not set DecimalTotalDocument or TO_FIXED_TOTALDOCUMENT if settings are not available', () => {
    component.permissions = [{ Name: 'edit' }, { Name: 'delete' }];
    component.editableField = ['Column1', 'Column2'] as any;
    component.selectedCompany = { Id: 1 } as ICompany;
    component.settings = [
      {
        Code: 'Decimal',
        Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }])
      } as ISettings,
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      }as ISettings
    ];
    component.docTbMapDisplayColumnsArgs = { editableFieldConf: {} };
    component.settings = [
      {
        Code: 'Payment',
        Json: JSON.stringify([{ CompanyId: 1, Config: 'SomePaymentConfig' }])
      } as ISettings
    ];

    (component as any).SetInitialData();

    expect(component.DecimalTotalDocument).toBe(0);
    expect(component.TO_FIXED_TOTALDOCUMENT).toBe('1.0-0');

  });
  //----
  it('debería mostrar una alerta si no se selecciona moneda', () => {
    component.documentForm = new FormBuilder().group({
      DocCurrency: [''],
      Amount: ['']
    });
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.2 } as ICurrentSession; 
    component.DecimalTotalDocument = 2;

    component.documentForm.controls['DocCurrency'].setValue(null);
    component.documentForm.controls['Amount'].setValue(100);
    
    component.SetTotalPayAccount();
    
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: `Seleccione moneda`
    });
    expect(component.documentForm.controls['Amount'].value).toBe(0);
  });

  it('debería mostrar una alerta si se selecciona moneda inválida', () => {
    component.documentForm = new FormBuilder().group({
      DocCurrency: [''],
      Amount: ['']
    });
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.2 } as ICurrentSession; 
    component.DecimalTotalDocument = 2;

    component.documentForm.controls['DocCurrency'].setValue('##');
    component.documentForm.controls['Amount'].setValue(100);
    
    component.SetTotalPayAccount();
    
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: `Seleccione moneda`
    });
    expect(component.documentForm.controls['Amount'].value).toBe(0);
  });

  it('debería calcular total y totalFC cuando la moneda es local', () => {
    component.documentForm = new FormBuilder().group({
      DocCurrency: [''],
      Amount: ['']
    });
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.2 } as ICurrentSession; 
    component.DecimalTotalDocument = 2;

    component.documentForm.controls['DocCurrency'].setValue('USD');
    component.documentForm.controls['Amount'].setValue(100);
    
    component.SetTotalPayAccount();
    
    expect(component.total).toBe(100); 
    expect(component.totalFC).toBeCloseTo(83.33, 2); 
  });

  it('debería calcular total y totalFC cuando la moneda es diferente de local', () => {component.documentForm = new FormBuilder().group({
    DocCurrency: [''],
    Amount: ['']
  });
  component.localCurrency = { Id: 'USD' } as ICurrencies; 
  component.currentSession = { Rate: 1.2 } as ICurrentSession; 
  component.DecimalTotalDocument = 2;

    component.documentForm.controls['DocCurrency'].setValue('EUR');
    component.documentForm.controls['Amount'].setValue(100);
    
    component.SetTotalPayAccount();
    
    expect(component.total).toBeCloseTo(120, 2); 
    expect(component.totalFC).toBe(100); 
  });
});
