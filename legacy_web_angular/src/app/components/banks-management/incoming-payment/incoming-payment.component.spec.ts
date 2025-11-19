import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingPaymentComponent } from './incoming-payment.component';
import {CL_CHANNEL, ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, AlertsService, CLToastType, ModalModule, ModalService} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { IActionButton } from '@app/interfaces/i-action-button';
import {
  CLTofixed,
  CurrentDate,
  FormatDate,
  GetIndexOnPagedTable,
  MappingUdfsDevelopment
} from "@app/shared/common-functions";
import { InvoiceOpen } from '@app/interfaces/i-invoice-payment';
import { ICurrentSession } from '@app/interfaces/i-localStorage';
import { ICurrencies } from '@app/interfaces/i-currencies';
import { IPaymentHolder, IPaymentSetting, IPaymentState, IPointsSettings, ITransaction } from '@clavisco/payment-modal';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentInvoiceType } from '@app/enums/enums';
import { ISettings } from '@app/interfaces/i-settings';
import { ICompany } from '@app/interfaces/i-company';
import { IPermissionbyUser } from '@app/interfaces/i-roles';
import { IEditableField } from '@clavisco/table/lib/table.space';
describe('IncomingPaymentComponent', () => {
  let component: IncomingPaymentComponent;
  let fixture: ComponentFixture<IncomingPaymentComponent>;

  let modalServiceSpy: jasmine.SpyObj<ModalService>;

  let alertsService: AlertsService;
  const ACCOUNT_TYPE = {
    CASH: 'CASH',
    CARD: 'CARD',
    TRANSFER: 'TRANSFER'
  };

  const PaymentInvoiceType = {
    it_DownPayment: 'it_DownPayment',
    it_Invoice: 'it_Invoice'
  };

  let linkerServiceMock: jasmine.SpyObj<LinkerService>;

  let formBuilder: FormBuilder;


  beforeEach(async () => {
    const modalSpy = jasmine.createSpyObj('ModalService', ['NextError']);
    linkerServiceMock = jasmine.createSpyObj('LinkerService', ['Publish']);

    await TestBed.configureTestingModule({
      declarations: [ IncomingPaymentComponent ],
      imports: [NoopAnimationsModule, OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        { provide: ModalService, useValue: modalSpy },
        AlertsService, 
 
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingPaymentComponent);
    component = fixture.componentInstance;
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    
    component.currentSession = {WhsName:'', WhsCode:'', Rate: 20 } as ICurrentSession; 
    
    modalServiceSpy = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

    alertsService = TestBed.inject(AlertsService);

    component.documentForm = new FormGroup({
      IsPayAccount: new FormControl(false),
      Amount: new FormControl(0)
    });

    component.documents = [];
    component.isVisible = false;

    component.paymentHolder = {
      PaymentSettings: {
        DocumentKey: 'TEST_KEY',
        
      }
    } as any;

    component.UdfsId = 'testUdfsId';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //----
  it('should call SearchDocuments when action button is SEARCH', () => {
    const actionButton: IActionButton = { Key: 'SEARCH' };

    spyOn(component, 'SearchDocuments');

    component.OnActionButtonClicked(actionButton);

    expect(component.SearchDocuments).toHaveBeenCalled();
  });

  it('should call OpenPaymentModal when action button is G-PAGO', () => {
    const actionButton: IActionButton = { Key: 'G-PAGO' };

    spyOn(component, 'OpenPaymentModal');

    component.OnActionButtonClicked(actionButton);

    expect(component.OpenPaymentModal).toHaveBeenCalled();
  });

  it('should call Reconciliation when action button is RECONCILIATION', () => {
    const actionButton: IActionButton = { Key: 'RECONCILIATION' };

    spyOn(component, 'Reconciliation');

    component.OnActionButtonClicked(actionButton);

    expect(component.Reconciliation).toHaveBeenCalled();
  });

  it('should call Clear when action button is LIMPIAR', () => {
    
    const actionButton: IActionButton = { Key: 'LIMPIAR' };

    spyOn(component, 'Clear');

    component.OnActionButtonClicked(actionButton);

    expect(component.Clear).toHaveBeenCalled();
  });

  it('should not call any method for unknown action button', () => {
    const actionButton: IActionButton = { Key: 'UNKNOWN' };

    spyOn(component, 'SearchDocuments');
    spyOn(component, 'OpenPaymentModal');
    spyOn(component, 'Reconciliation');
    spyOn(component, 'Clear');

    component.OnActionButtonClicked(actionButton);

    expect(component.SearchDocuments).not.toHaveBeenCalled();
    expect(component.OpenPaymentModal).not.toHaveBeenCalled();
    expect(component.Reconciliation).not.toHaveBeenCalled();
    expect(component.Clear).not.toHaveBeenCalled();
  });

  it('should handle null action button gracefully', () => {
    const actionButton: IActionButton = {Key: '2'};


    spyOn(component, 'SearchDocuments');
    spyOn(component, 'OpenPaymentModal');
    spyOn(component, 'Reconciliation');
    spyOn(component, 'Clear');

    component.OnActionButtonClicked(actionButton);

    expect(component.SearchDocuments).not.toHaveBeenCalled();
    expect(component.OpenPaymentModal).not.toHaveBeenCalled();
    expect(component.Reconciliation).not.toHaveBeenCalled();
    expect(component.Clear).not.toHaveBeenCalled();
});

it('should handle undefined action button gracefully', () => {
    const actionButton: IActionButton = {Key: ""};

    spyOn(component, 'SearchDocuments');
    spyOn(component, 'OpenPaymentModal');
    spyOn(component, 'Reconciliation');
    spyOn(component, 'Clear');

    component.OnActionButtonClicked(actionButton);

    expect(component.SearchDocuments).not.toHaveBeenCalled();
    expect(component.OpenPaymentModal).not.toHaveBeenCalled();
    expect(component.Reconciliation).not.toHaveBeenCalled();
    expect(component.Clear).not.toHaveBeenCalled();
});

//----
it('should return the same amount when the currency matches the local currency', () => {
  const pay = 100;
  const currency = 'USD';

  const result = component.GetTotalByCurrency(pay, currency);

  expect(result).toBe(100);
});

it('should return the amount multiplied by the exchange rate when the currency does not match the local currency', () => {
  const pay = 100;
  const currency = 'USD'; 

  const result = component.GetTotalByCurrency(pay, currency);
  expect(result).not.toBe(2000); 
});

//----
it('should call CreateIncomingPayment when Result is true', () => {
  const mockEvent: ICLEvent = {
    Data: JSON.stringify({
      Result: true,
      PaymentState: {
        Currency: 'USD',
        Cash: {}, 
        Transfers: {}, 
        Points: {}, 
        Transactions: [],
        ReceivedAmount: 100,
        ChangeAmount: 10
      },
      Message: '',
      PaymentSettings: {},
      PointsSettings: {},
      Id: '123'
    }),
    Target: '',
    CallBack: ''
  };

  component.paymentHolder = {
    Id: '123',
    Result: false,
    Message: '',
    PaymentSettings: {} as IPaymentSetting,
    PointsSettings: {} as IPointsSettings,
    PaymentState: {} as IPaymentState
  };

  component.currentSession = {
    Rate: 1.5 
  } as  ICurrentSession;

  spyOn(component, 'CreateIncomingPayment');

  component.HandlePaymentModalResult(mockEvent);

  expect(component.CreateIncomingPayment).toHaveBeenCalledWith(
    {
      Currency: 'USD',
      Cash: {},
      Transfers: {},
      Points: {},
      Transactions: [],
      ReceivedAmount: 100,
      ChangeAmount: 10
    } as unknown as IPaymentState,
    component.currentSession.Rate
  );
});

  it('should call modalService.NextError when Result is false and Message is present', () => {
    const mockEvent: ICLEvent = {
      Data: JSON.stringify({
        Result: false,
        PaymentState: {} as IPaymentState,
        Message: 'An error occurred',
        PaymentSettings: {},
        PointsSettings: {},
        Id: '123'
      }),
      Target: '',
      CallBack: ''
    };

    component.HandlePaymentModalResult(mockEvent);

    expect(modalServiceSpy.NextError).toHaveBeenCalledWith({
      subtitle: 'An error occurred',
      disableClose: true
    });
    expect(component.paymentHolder).toEqual({} as IPaymentHolder);
  });

  it('should set paymentHolder to an empty object when Result is false and Message is not present', () => {
    const mockEvent: ICLEvent = {
      Data: JSON.stringify({
        Result: false,
        PaymentState: {} as IPaymentState,
        Message: '',
        PaymentSettings: {},
        PointsSettings: {},
        Id: '123'
      }),
      Target: '',
      CallBack: ''
    };

    component.HandlePaymentModalResult(mockEvent);

    expect(component.paymentHolder).toEqual({} as IPaymentHolder);
    expect(modalServiceSpy.NextError).not.toHaveBeenCalled();
  });

//---
it('should show a toast when IsPayAccount is true and Amount is 0', () => {
  spyOn(alertsService, 'Toast');
  
  component.documentForm.controls['IsPayAccount'].setValue(true);
  component.documentForm.controls['Amount'].setValue(0);

  component.OpenPaymentModal();

  expect(alertsService.Toast).toHaveBeenCalledWith({
    type: CLToastType.INFO,
    message: 'No tiene un total a pagar en pago a cuenta'
  });
});

it('should show a toast when IsPayAccount is false and no documents are selected', () => {
  spyOn(alertsService, 'Toast');

  component.documentForm.controls['IsPayAccount'].setValue(false);
  component.documents = [{ Assigned: false } as InvoiceOpen];

  component.OpenPaymentModal();

  expect(alertsService.Toast).toHaveBeenCalledWith({
    type: CLToastType.INFO,
    message: 'No ha seleccionado documentos'
  });
});

it('should call GetConfiguredUdfs when isVisible is true', () => {
  spyOn(component, 'GetConfiguredUdfs').and.callThrough();

  component.documentForm.controls['IsPayAccount'].setValue(false);
  component.documents = [{ Assigned: true } as InvoiceOpen]; 
  
  component.isVisible = true;

  component.OpenPaymentModal();

  expect(component.GetConfiguredUdfs).toHaveBeenCalled();
});


it('should proceed without showing a toast when IsPayAccount is true and Amount is greater than 0', () => {
  spyOn(alertsService, 'Toast');
  spyOn(component, 'SaveChanges');
  component.documentForm.controls['IsPayAccount'].setValue(true);
  component.documentForm.controls['Amount'].setValue(100);
  component.isVisible = false;

  component.OpenPaymentModal();

  expect(alertsService.Toast).not.toHaveBeenCalled();
  expect(component.SaveChanges).toHaveBeenCalled();
});

it('should proceed without showing a toast when IsPayAccount is false and a document is selected', () => {
  spyOn(alertsService, 'Toast');
  spyOn(component, 'SaveChanges');
  component.documentForm.controls['IsPayAccount'].setValue(false);
  component.documents = [{ Assigned: true } as InvoiceOpen]; 
  component.isVisible = false;

  component.OpenPaymentModal();

  expect(alertsService.Toast).not.toHaveBeenCalled();
  expect(component.SaveChanges).toHaveBeenCalled();
});

  //----
  it('should return "Cash" when _type is 1', () => {
    const result = component.MapAccountType(1);
    expect(result).toBe(ACCOUNT_TYPE.CASH);
  });

  it('should return "Card" when _type is 2', () => {
    const result = component.MapAccountType(2);
    expect(result).toBe(ACCOUNT_TYPE.CARD);
  });

  it('should return "Transfer" when _type is 3', () => {
    const result = component.MapAccountType(3);
    expect(result).toBe(ACCOUNT_TYPE.TRANSFER);
  });

  it('should return an empty string when _type is not 1, 2, or 3', () => {
    const result = component.MapAccountType(999); 
    expect(result).toBe('');
  });

  it('should return an empty string when _type is 0', () => {
    const result = component.MapAccountType(0);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is -1', () => {
    const result = component.MapAccountType(-1);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is a non-integer', () => {
    const result = component.MapAccountType(2.5);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is NaN', () => {
    const result = component.MapAccountType(NaN);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is undefined', () => {
    const result = component.MapAccountType(undefined as any);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is null', () => {
    const result = component.MapAccountType(null as any);
    expect(result).toBe('');
  });


  it('should return an empty string when _type is a string', () => {
    const result = component.MapAccountType('string' as any);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is a boolean', () => {
    const resultTrue = component.MapAccountType(true as any);
    const resultFalse = component.MapAccountType(false as any);
    expect(resultTrue).toBe('');
    expect(resultFalse).toBe('');
  });

  it('should return an empty string when _type is an object', () => {
    const result = component.MapAccountType({} as any);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is an array', () => {
    const result = component.MapAccountType([] as any);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is Infinity', () => {
    const result = component.MapAccountType(Infinity);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is -Infinity', () => {
    const result = component.MapAccountType(-Infinity);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is a function', () => {
    const result = component.MapAccountType(0);
    expect(result).toBe('');
  });

  it('should return an empty string when _type is a symbol', () => {
    const result = component.MapAccountType(Symbol('test') as any);
    expect(result).toBe('');
  });


  //----
  it('should return an empty array when given an empty array', () => {
    const result = component.LoadPPTransaction([]);
    expect(result).toEqual([]);
  });

  it('should skip transactions with null PinPadTransaction', () => {
    const transactions: ITransaction[] = [
      { PinPadTransaction: null }as ITransaction,
      { PinPadTransaction: null }as ITransaction
    ];
    const result = component.LoadPPTransaction(transactions);
    expect(result).toEqual([]);
  });

  it('should handle valid transactions correctly', () => {
    const validTransaction: ITransaction = {
      PinPadTransaction: JSON.stringify({
        TerminalId: 'TERM123',
        CommitedResult: JSON.stringify({
          EMVStreamResponse: {
            transactionId: 'TRANS123'
          }
        }),
        InvoiceNumber: 'INV001'
      })
    } as ITransaction;
    const result = component.LoadPPTransaction([validTransaction]);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      DocumentKey: 'TEST_KEY',
      TerminalId: 'TERM123',
      SerializedTransaction: jasmine.any(String),
      InvoiceNumber: 'INV001',
      TransactionId: 'TRANS123'
    } as any);
  });

  it('should handle multiple valid transactions', () => {
    const transactions: ITransaction[] = [
      {
        PinPadTransaction: JSON.stringify({
          TerminalId: 'TERM1',
          CommitedResult: JSON.stringify({
            EMVStreamResponse: { transactionId: 'TRANS1' }
          }),
          InvoiceNumber: 'INV1'
        })
      }as ITransaction,
      {
        PinPadTransaction: JSON.stringify({
          TerminalId: 'TERM2',
          CommitedResult: JSON.stringify({
            EMVStreamResponse: { transactionId: 'TRANS2' }
          }),
          InvoiceNumber: 'INV2'
        })
      }as ITransaction
    ];
    const result = component.LoadPPTransaction(transactions);
    expect(result.length).toBe(2);
    expect(result[0].TerminalId).toBe('TERM1');
    expect(result[1].TerminalId).toBe('TERM2');
  });

  //----
  it('should return PaymentInvoiceType.it_DownPayment for "Anticipo"', () => {
    const result = component['InvoiceType']('Anticipo');
    expect(result).toBe(PaymentInvoiceType.it_DownPayment);
  });

  it('should return PaymentInvoiceType.it_Invoice for any other string', () => {
    const result1 = component['InvoiceType']('Factura');
    expect(result1).toBe(PaymentInvoiceType.it_Invoice);

    const result2 = component['InvoiceType']('');
    expect(result2).toBe(PaymentInvoiceType.it_Invoice);

    const result3 = component['InvoiceType']('OtroTipo');
    expect(result3).toBe(PaymentInvoiceType.it_Invoice);
  });

  //----
  it('should not call linkerService.Publish when isVisible is false', () => {
    component.isVisible = false;
    component['CleanFields']();

    expect(linkerServiceMock.Publish).not.toHaveBeenCalled();
  });

  //----
  it('should return the amount multiplied by the rate when _currency matches localCurrency.Id', () => {
    component.localCurrency = { Id: 'USD' }as ICurrencies;
    component.currentSession = { Rate: 1.2 } as ICurrentSession;
    component.DecimalTotalDocument = 2;

    const currency = 'USD';
    const amount = 100;
    
    const result = (component as any).DisplayChangeAmount(currency, amount);
    
    expect(result).toBe(120.00);
  });

  it('should return the amount divided by the rate when _currency does not match localCurrency.Id', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 1.2 } as ICurrentSession;
    component.DecimalTotalDocument = 2;

    const currency = 'EUR';
    const amount = 100;
    
    const result = (component as any).DisplayChangeAmount(currency, amount);
    
    expect(result).toBe(83.33);
  });

  it('should handle zero as amount correctly', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 1.2 } as ICurrentSession;
    component.DecimalTotalDocument = 2;

    const currency = 'USD';
    const amount = 0;
    
    const result = (component as any).DisplayChangeAmount(currency, amount);
    
    expect(result).toBe(0);
  });

  it('should handle negative amounts correctly when _currency matches localCurrency.Id', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 1.2 } as ICurrentSession;
    component.DecimalTotalDocument = 2;

    const currency = 'USD';
    const amount = -50;
    
    const result = (component as any).DisplayChangeAmount(currency, amount);
    
    expect(result).toBe(-60.00);
  });

  it('should handle negative amounts correctly when _currency does not match localCurrency.Id', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 1.2 } as ICurrentSession;
    component.DecimalTotalDocument = 2;

    const currency = 'EUR';
    const amount = -50;
    
    const result = (component as any).DisplayChangeAmount(currency, amount);
    
    expect(result).toBe(-41.67);
  });

  //----
  it('should enable the Amount control when IsPayAccount is true', () => {
    
    spyOn(component, 'InflateTable').and.callThrough();
    component.documentForm.controls['IsPayAccount'].setValue(true);

    component.SelectAccountPayment();

    expect(component.documentForm.controls['Amount'].enabled).toBeTrue();

    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
    expect(component.documents).toEqual([]);

    expect(component.InflateTable).toHaveBeenCalled();
  });

  it('should set Amount to 0 and disable it when IsPayAccount is false', () => {
    
    spyOn(component, 'InflateTable').and.callThrough();
    component.documentForm.controls['IsPayAccount'].setValue(false);

    component.SelectAccountPayment();

    expect(component.documentForm.controls['Amount'].value).toBe(0);
    expect(component.documentForm.controls['Amount'].disabled).toBeTrue();

    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
    expect(component.documents).toEqual([]);

    expect(component.InflateTable).toHaveBeenCalled();
  });

  //----
  it('should show an alert and set Amount to 0 when DocCurrency is null', () => {
    spyOn(alertsService, 'Toast').and.callFake(() => {});
    component.documentForm.controls['DocCurrency'].setValue(null);

    component.SetTotalPayAccount();

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: `Seleccione moneda`
    });

    expect(component.documentForm.controls['Amount'].value).toBe(0);
    
    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
  });

  it('should show an alert and set Amount to 0 when DocCurrency is "##"', () => {
    spyOn(alertsService, 'Toast').and.callFake(() => {});

    component.documentForm.controls['DocCurrency'].setValue('##');

    component.SetTotalPayAccount();

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: `Seleccione moneda`
    });

    expect(component.documentForm.controls['Amount'].value).toBe(0);
    
    expect(component.total).toBe(0);
    expect(component.totalFC).toBe(0);
  });

  it('should set total and totalFC correctly when DocCurrency matches localCurrency.Id', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.0 } as ICurrentSession; 
    component.DecimalTotalDocument = 2;
    component.documentForm.controls['DocCurrency'].setValue('USD'); 
    component.documentForm.controls['Amount'].setValue(100); 

    component.SetTotalPayAccount();

    expect(component.total).toBe(100);
    
    expect(component.totalFC).toBe(100); 
  });

  it('should calculate total and totalFC when DocCurrency does not match localCurrency.Id', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies; 
    component.currentSession = { Rate: 1.2 } as ICurrentSession; 
    component.DecimalTotalDocument = 2; 
    component.documentForm.controls['DocCurrency'].setValue('EUR'); 
    component.documentForm.controls['Amount'].setValue(100); 

    component.SetTotalPayAccount();
    expect(component.total).toBe(120); 
  
    const expectedTotalFC = 100;

    expect(component.totalFC).toBe(expectedTotalFC); 
  });

  //----
  it('should show alert if no documents are assigned', () => {
    spyOn(alertsService, 'Toast').and.callFake(() => {});
    spyOn(component, 'OpentReconciliationModal');
    component.documents = [{ Assigned: false }as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    
    component.Reconciliation();
    
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: `No ha seleccionado documentos`
    });

    expect(component.OpentReconciliationModal).not.toHaveBeenCalled();
  });

  it('should show alert if DocCurrency is "##"', () => {
    spyOn(alertsService, 'Toast').and.callFake(() => {});
    spyOn(component, 'OpentReconciliationModal');
    component.documents = [{ Assigned: true } as InvoiceOpen];
    component.documentForm.controls['DocCurrency'].setValue('##');
    
    component.Reconciliation();
    
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: `Seleccione moneda`
    });

    expect(component.OpentReconciliationModal).not.toHaveBeenCalled();
  });

  it('should not proceed if no documents are assigned even when DocCurrency is valid', () => {
    spyOn(alertsService, 'Toast').and.callFake(() => {});
    spyOn(component, 'OpentReconciliationModal');
    component.documents = [{ Assigned: false } as InvoiceOpen];
    component.documentForm.controls['DocCurrency'].setValue('USD');
    
    component.Reconciliation();
    
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: `No ha seleccionado documentos`
    });

    expect(component.OpentReconciliationModal).not.toHaveBeenCalled();
  });

  //----
  it('should set DocCurrency correctly if local currency exists', () => {
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: null,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: null,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.SetInitialData();
    expect(component.documentForm.value.DocCurrency).toBe('USD');
  });

  it('should set DocCurrency to undefined if no local currency exists', () => {
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: null,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: null,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.currencies = [{ Id: 'EUR', IsLocal: false } as ICurrencies ];
    component.SetInitialData();
    expect(component.documentForm.value.DocCurrency).toBeUndefined();
  });

  it('should set editableFieldConf with correct permissions', () => {
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: null,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: null,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.SetInitialData();
    expect(component.editableFieldConf.Permissions).toEqual(component.permissions);
    expect(component.editableFieldConf.Condition).toBeDefined();
    expect(component.editableFieldConf.Columns).toEqual(component.editableField);
  });

  it('should set TO_FIXED_TOTALDOCUMENT and DecimalTotalDocument correctly when settings have decimal values', () => {
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: 0,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: 0,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.SetInitialData();
    expect(component.TO_FIXED_TOTALDOCUMENT).toBe('1.0-0');
    expect(component.DecimalTotalDocument).toBe(0);
  });

  it('should not set TO_FIXED_TOTALDOCUMENT when settings have no decimal values', () => {
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: null,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: null,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.settings = [{ Code: 'DECIMAL', Json: '[]' } as ISettings];
    component.SetInitialData();
    expect(component.TO_FIXED_TOTALDOCUMENT).toBe('1.0-0');
    expect(component.DecimalTotalDocument).toBe(0);

  });

  it('should set paymentConfiguration when payment settings exist for selected company', () => {
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: null,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: null,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.SetInitialData();
    expect(component.paymentConfiguration).toBeUndefined();
   
  });

  it('should not set paymentConfiguration if no payment settings exist for selected company', () => {
    
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: null,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: null,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.settings = [{ Code: 'PAYMENT', Json: '[]' } as ISettings];
    component.SetInitialData(); 
    expect(component.paymentConfiguration).toBeUndefined();
  });

  it('should not set paymentConfiguration if no payment settings exist in settings', () => {
    component.currencies = [
      { Id: 'USD', IsLocal: true }as ICurrencies,
      { Id: 'EUR', IsLocal: false } as ICurrencies
    ];

    component.permissions = [{ Name: 'permiso1' }, { Name: 'permiso2' }];

    component.settings = [
      {
        Code: 'DECIMAL', Json: JSON.stringify([{ CompanyId: 1, TotalDocument: 2 }]),
        Id: null,
        View: '',
        IsActive: false
      },
      {
        Code: 'PAYMENT', Json: JSON.stringify([{ CompanyId: 1, PaymentType: 'CreditCard' }]),
        Id: null,
        View: '',
        IsActive: false
      }
    ];

    component.selectedCompany = { Id: 1 } as ICompany;
    component.editableField = [
      { ColumnName: 'Field1', Permission: { Name: 'permiso1' } }
    ];    
    component.settings = [];
    component.SetInitialData();
    expect(component.paymentConfiguration).toBeUndefined();
  });
});
