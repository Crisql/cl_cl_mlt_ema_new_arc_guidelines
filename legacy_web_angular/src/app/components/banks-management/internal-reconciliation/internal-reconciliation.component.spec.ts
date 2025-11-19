import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalReconciliationComponent } from './internal-reconciliation.component';
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, AlertsService, CLToastType, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { IActionButton } from '@app/interfaces/i-action-button';
import { InvoiceOpen } from '@app/interfaces/i-invoice-payment';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ICurrentSession } from '@app/interfaces/i-localStorage';
import { ICurrencies } from '@app/interfaces/i-currencies';
import { FormBuilder } from '@angular/forms';

describe('InternalReconciliationComponent', () => {
  let component: InternalReconciliationComponent;
  let fixture: ComponentFixture<InternalReconciliationComponent>;

  let alertsService: jasmine.SpyObj<AlertsService>;

  beforeEach(async () => {
    alertsService = jasmine.createSpyObj('AlertsService', ['Toast']);
    await TestBed.configureTestingModule({
      declarations: [ InternalReconciliationComponent ],
      imports: [NoopAnimationsModule,OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
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
    fixture = TestBed.createComponent(InternalReconciliationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call SearchDocuments when action is SEARCH', () => {
    const actionButton: IActionButton = { Key: 'SEARCH' };
    spyOn<any>(component, 'SearchDocuments');

    component.OnActionButtonClicked(actionButton);

    expect(component['SearchDocuments']).toHaveBeenCalled();
  });

  it('should call Reconciliation when action is RECONCILIATION', () => {
    const actionButton: IActionButton = { Key: 'RECONCILIATION' };
    spyOn<any>(component, 'Reconciliation');

    component.OnActionButtonClicked(actionButton);

    expect(component['Reconciliation']).toHaveBeenCalled();
  });

  it('should call ResetDocument when action is CLEAN', () => {
    const actionButton: IActionButton = { Key: 'CLEAN' };
    spyOn<any>(component, 'ResetDocument');

    component.OnActionButtonClicked(actionButton);

    expect(component['ResetDocument']).toHaveBeenCalled();
  });

  it('should not call any action method for unknown action', () => {
    const actionButton: IActionButton = { Key: 'UNKNOWN' };
    spyOn<any>(component, 'SearchDocuments');
    spyOn<any>(component, 'Reconciliation');
    spyOn<any>(component, 'ResetDocument');

    component.OnActionButtonClicked(actionButton);

    expect(component['SearchDocuments']).not.toHaveBeenCalled();
    expect(component['Reconciliation']).not.toHaveBeenCalled();
    expect(component['ResetDocument']).not.toHaveBeenCalled();
  });

  //----
  it('should not update Pago when Row.Pago is 0 and EventName is InputField and call InflateTable', () => {
    component.documents = [
      { Assigned: false, Pago: 0, SaldoTable: 100 } as InvoiceOpen,
      { Assigned: false, Pago: 0, SaldoTable: 200 } as InvoiceOpen
    ];
    const event: ICLEvent = {
      Data: JSON.stringify({
        ItemsPeerPage: [],
        RowIndex: 0,
        CurrentPage: 0,
        Row: { Pago: 0, SaldoTable: 100, Assigned: true, Id: 1 },
        EventName: 'InputField'
      }),
      Target: '',
      CallBack: ''
    };

    component.OnTableInvoiceItemSelectionActivated(event);

    expect(component.documents[0].Pago).toBe(0);
  });

  // it('should not assign Pago when Row.Pago is greater than SaldoTable', () => {
  //   component.documents = [
  //     { Assigned: false, Pago: 0, SaldoTable: 100 } as InvoiceOpen,
  //     { Assigned: false, Pago: 0, SaldoTable: 200 } as InvoiceOpen
  //   ];

  //   const event: ICLEvent = {
  //     Data: JSON.stringify({
  //       ItemsPeerPage: [],
  //       RowIndex: 0,
  //       CurrentPage: 0,
  //       Row: { Pago: 150, SaldoTable: 100, Assigned: false, Id: 1 },
  //       EventName: 'SomeOtherEvent'
  //     }),
  //     Target: '',
  //     CallBack: ''
  //   };


  //   component.OnTableInvoiceItemSelectionActivated(event);


  //   expect(component.documents[0].Pago).toBe(0);
  // });

  //----
  it('should return the payment amount when the currency matches the local currency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 2 } as ICurrentSession;

    const payment = 100;
    const currency = 'USD';


    const result = (component as any).GetTotalByCurrency(payment, currency);


    expect(result).toBe(100);
  });

  it('should return the converted amount when the currency does not match the local currency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 2 } as ICurrentSession;

    const payment = 100;
    const currency = 'EUR';


    const result = (component as any).GetTotalByCurrency(payment, currency);


    expect(result).toBe(200);
  });

  it('should handle payment values as numbers even if passed as strings', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 2 } as ICurrentSession;

    const payment = '150';
    const currency = 'USD';


    const result = (component as any).GetTotalByCurrency(payment, currency);


    expect(result).toBe(150);
  });

  it('should handle payment values as numbers even if passed as strings when currency does not match', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currentSession = { Rate: 2 } as ICurrentSession;

    const payment = '150';
    const currency = 'EUR';


    const result = (component as any).GetTotalByCurrency(payment, currency);


    expect(result).toBe(300);
  });

  //----
  it('should update Assigned and call InflateTableCreditNemo when Row.Pago <= SaldoTable and EventName is InputField and Pago <= 0', () => {
    component.creditnemos = [{ Assigned: false, Pago: 0 } as InvoiceOpen];
    spyOn(component as any, 'InflateTableCreditNemo').and.callFake(() => {});
    spyOn(component as any, 'GetTotals').and.callFake(() => {});


    const eventMock = {
      Data: JSON.stringify({
        Row: { Pago: 0, SaldoTable: 100, Assigned: true },
        ItemsPeerPage: 1,
        RowIndex: 0,
        CurrentPage: 0,
        EventName: 'InputField'
      })
    } as ICLEvent;


    component.OnTableCreditNemoItemSelectionActivated(eventMock);


    expect(component.creditnemos[0].Assigned).toBe(true);
    expect(component.creditnemos[0].Pago).toBe(0);
    expect(component['InflateTableCreditNemo']).toHaveBeenCalled();
});

it('should update Pago and call GetTotals and InflateTableCreditNemo when Row.Pago <= SaldoTable and EventName is InputField and Pago > 0', () => {
    component.creditnemos = [{ Assigned: false, Pago: 0 } as InvoiceOpen];
    spyOn(component as any, 'InflateTableCreditNemo').and.callFake(() => {});
    spyOn(component as any, 'GetTotals').and.callFake(() => {});


    const eventMock = {
      Data: JSON.stringify({
        Row: { Pago: 50, SaldoTable: 100, Assigned: true },
        ItemsPeerPage: 1,
        RowIndex: 0,
        CurrentPage: 0,
        EventName: 'InputField'
      })
    } as ICLEvent;


    component.OnTableCreditNemoItemSelectionActivated(eventMock);


    expect(component.creditnemos[0].Pago).toBe(50);
    expect(component['GetTotals']).toHaveBeenCalled();
    expect(component['InflateTableCreditNemo']).toHaveBeenCalled();
});

it('should set Pago to SaldoTable when Row.Pago <= SaldoTable and EventName is not InputField and Row.Assigned is true', () => {
    component.creditnemos = [{ Assigned: false, Pago: 0 } as InvoiceOpen];
    spyOn(component as any, 'InflateTableCreditNemo').and.callFake(() => {});
    spyOn(component as any, 'GetTotals').and.callFake(() => {});


    const eventMock = {
      Data: JSON.stringify({
        Row: { Pago: 50, SaldoTable: 100, Assigned: true },
        ItemsPeerPage: 1,
        RowIndex: 0,
        CurrentPage: 0,
        EventName: 'SomeOtherEvent'
      })
    } as ICLEvent;


    component.OnTableCreditNemoItemSelectionActivated(eventMock);


    expect(component.creditnemos[0].Pago).toBe(100);
    expect(component['GetTotals']).toHaveBeenCalled();
    expect(component['InflateTableCreditNemo']).toHaveBeenCalled();
});

it('should set Pago to 0 when Row.Pago <= SaldoTable and EventName is not InputField and Row.Assigned is false', () => {
    component.creditnemos = [{ Assigned: false, Pago: 0 } as InvoiceOpen];
    spyOn(component as any, 'InflateTableCreditNemo').and.callFake(() => {});
    spyOn(component as any, 'GetTotals').and.callFake(() => {});


    const eventMock = {
      Data: JSON.stringify({
        Row: { Pago: 50, SaldoTable: 100, Assigned: false },
        ItemsPeerPage: 1,
        RowIndex: 0,
        CurrentPage: 0,
        EventName: 'SomeOtherEvent'
      })
    } as ICLEvent;


    component.OnTableCreditNemoItemSelectionActivated(eventMock);


    expect(component.creditnemos[0].Pago).toBe(0);
    expect(component['GetTotals']).toHaveBeenCalled();
    expect(component['InflateTableCreditNemo']).toHaveBeenCalled();
});

it('should show a toast and reset Pago when Row.Pago > SaldoTable', () => {
  fixture.detectChanges();
    component.creditnemos = [{ Assigned: false, Pago: 0 } as InvoiceOpen];
    spyOn(component as any, 'InflateTableCreditNemo').and.callFake(() => {});
    spyOn(component as any, 'GetTotals').and.callFake(() => {});


    const eventMock = {
      Data: JSON.stringify({
        Row: { Pago: 150, SaldoTable: 100, Assigned: true },
        ItemsPeerPage: 1,
        RowIndex: 0,
        CurrentPage: 0,
        EventName: 'InputField'
      })
    } as ICLEvent;


    component.OnTableCreditNemoItemSelectionActivated(eventMock);


    expect(component.creditnemos[0].Assigned).toBe(false);
    expect(component.creditnemos[0].Pago).toBe(0);

    expect(component['InflateTableCreditNemo']).toHaveBeenCalled();
});

//----
  it('should return totalCreditNemo when _option is 2 and localCurrency matches currency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    const result = component.DisplayTotal(2);
    expect(result).toBe(100);
  });

  it('should return totalCreditNemoFC when _option is 2 and localCurrency does not match currency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    component.currency = 'EUR';
    const result = component.DisplayTotal(2);
    expect(result).toBe(200);
  });

  it('should return totalInvoice when _option is 1 and localCurrency matches currency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    const result = component.DisplayTotal(1);
    expect(result).toBe(300);
  });

  it('should return totalInvoiceFC when _option is 1 and localCurrency does not match currency', () => {

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    component.currency = 'EUR';
    const result = component.DisplayTotal(1);
    expect(result).toBe(400);
  });

  it('should return conciliationTotal when _option is not 1 or 2 and localCurrency matches currency', () => {

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    const result = component.DisplayTotal(0);
    expect(result).toBe(500);
  });

  it('should return conciliationTotalFC when _option is not 1 or 2 and localCurrency does not match currency', () => {

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    component.currency = 'EUR';
    const result = component.DisplayTotal(0);
    expect(result).toBe(600);
  });

  //----
  it('should return totalCreditNemoFC when _option is 2 and localCurrency matches currency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    const result = component.DisplayTotalHover(2);
    expect(result).toBe(200);
  });

  it('should return totalCreditNemo when _option is 2 and localCurrency does not match currency', () => {

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    component.currency = 'EUR';
    const result = component.DisplayTotalHover(2);
    expect(result).toBe(100);
  });

  it('should return totalInvoiceFC when _option is 1 and localCurrency matches currency', () => {
    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    const result = component.DisplayTotalHover(1);
    expect(result).toBe(400);
  });

  it('should return totalInvoice when _option is 1 and localCurrency does not match currency', () => {

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    component.currency = 'EUR';
    const result = component.DisplayTotalHover(1);
    expect(result).toBe(300);
  });

  it('should return conciliationTotalFC when _option is not 1 or 2 and localCurrency matches currency', () => {

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    const result = component.DisplayTotalHover(0);
    expect(result).toBe(600);
  });

  it('should return conciliationTotal when _option is not 1 or 2 and localCurrency does not match currency', () => {

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currency = 'USD';
    component.totalCreditNemo = 100;
    component.totalCreditNemoFC = 200;
    component.totalInvoice = 300;
    component.totalInvoiceFC = 400;
    component.conciliationTotal = 500;
    component.conciliationTotalFC = 600;

    component.currency = 'EUR';
    const result = component.DisplayTotalHover(0);
    expect(result).toBe(500);
  });

  //----
  it('should set symbolCurrency to "₡" when the local currency matches the selected currency', () => {
    component.documentForm = new FormBuilder().group({
      DocCurrency: ['']
    });

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currencies = [
      { Id: 'USD', Symbol: '₡', IsLocal: true } as ICurrencies,
      { Id: 'EUR', Symbol: '€', IsLocal: false }as ICurrencies
    ];

    component.documentForm.controls['DocCurrency'].setValue('USD');
    component.SelectCurrency();
    expect(component.symbolCurrency).toBe('₡');
  });

  it('should set symbolCurrency to "$" when the local currency does not match the selected currency', () => {
    component.documentForm = new FormBuilder().group({
      DocCurrency: ['']
    });

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currencies = [
      { Id: 'USD', Symbol: '₡', IsLocal: true } as ICurrencies,
      { Id: 'EUR', Symbol: '€', IsLocal: false }as ICurrencies
    ];

    component.documentForm.controls['DocCurrency'].setValue('EUR');
    component.SelectCurrency();
    expect(component.symbolCurrency).toBe('$');
  });

  it('should set symbolCurrency based on the local currency in currencies array when no match is found', () => {
    component.documentForm = new FormBuilder().group({
      DocCurrency: ['']
    });

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currencies = [
      { Id: 'USD', Symbol: '₡', IsLocal: true } as ICurrencies,
      { Id: 'EUR', Symbol: '€', IsLocal: false }as ICurrencies
    ];

    component.documentForm.controls['DocCurrency'].setValue('JPY');

    component.SelectCurrency();
    const expectedSymbol = component.currencies.find(c => c.Id === 'USD')?.Symbol || '';
    expect(component.symbolCurrency).toBe('$');

  });

  it('should set symbolCurrency to empty string when no local currency is found in currencies array', () => {
    component.documentForm = new FormBuilder().group({
      DocCurrency: ['']
    });

    component.localCurrency = { Id: 'USD' } as ICurrencies;
    component.currencies = [
      { Id: 'USD', Symbol: '₡', IsLocal: true } as ICurrencies,
      { Id: 'EUR', Symbol: '€', IsLocal: false }as ICurrencies
    ];

    component.currencies = [
      { Id: 'EUR', Symbol: '€', IsLocal: false } as ICurrencies
    ];
    component.documentForm.controls['DocCurrency'].setValue('JPY');

    component.SelectCurrency();
    expect(component.symbolCurrency).toBe('$');
  });

  //----
  it('should show a toast when no documents are selected', () => {
    fixture.detectChanges();
    component.documents = [{ Assigned: false } as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    component.Reconciliation();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'No ha seleccionado facturas'
    });
  });

  it('should show a toast when no credit notes are selected', () => {
    fixture.detectChanges();
    component.documents = [{ Assigned: true } as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    component.creditnemos = [{ Assigned: false } as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    component.Reconciliation();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'No ha seleccionado notas de crédito'
    });
  });

  it('should show a toast when the conciliation total is not zero', () => {
    fixture.detectChanges();
    component.documents = [{ Assigned: true } as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    component.creditnemos = [{ Assigned: true } as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    component.conciliationTotal = 100
    component.Reconciliation();

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'El monto de conciliación debe ser 0.'
    });
  });

  it('should not show any toast if all conditions are met', () => {
    fixture.detectChanges();
    component.documents = [{ Assigned: true } as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    component.creditnemos = [{ Assigned: true } as InvoiceOpen, { Assigned: false } as InvoiceOpen];
    component.conciliationTotal = 0;
    component.Reconciliation();
  });
});
