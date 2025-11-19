import { Injectable } from "@angular/core";
import { htmlToText } from "html-to-text";
import { SupportedPrintingType, DocumentType } from "src/app/common";
import {
  BusinessPartnersModel,
  ICompanyInformation,
  ICashDeskClosingLine,
  ICurrency,
  IMeasurementUnit,
} from "src/app/models";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial/ngx";
import { LocalStorageService } from "./local-storage.service";
import { CommonService } from "./common.service";
import { TranslateService } from "@ngx-translate/core";
import { LoadingController } from "@ionic/angular";
import { AlertType, LocalStorageVariables } from '../common/enum';
import { Repository } from "./repository.service";
import { formatDate } from "@angular/common";
import { IDocumentInPayment } from "../models/db/Doc-model";
import { IDocumentLine } from "../interfaces/i-item";
import { CalculationService } from "./calculation.service";
import { ILinesToPrint, IOfflineZPLData } from "../interfaces/i-print";
import { IBusinessPartners } from "../interfaces/i-business-partners";

@Injectable({
  providedIn: "root",
})
export class PrintingService {
  constructor(
    private repositoryConfiguration: Repository.Configuration, 
    private bluetoothSerial: BluetoothSerial, 
    private localStorageService: LocalStorageService, 
    private commonService: CommonService, 
    private calculationService: CalculationService, 
    private repositoryPrintFormat: Repository.PrintFormatZPLOffline, 
    private repositoryCompanyInformation: Repository.Company
  ) { }

  async CreateDocumentPrintFormat(
    _customer: BusinessPartnersModel,
    _products: IDocumentLine[],
    _mUnits: IMeasurementUnit[],
    _companyInfo: ICompanyInformation,
    _vendor: string,
    _subTotal: number,
    _discount: number,
    _tax: number,
    _total: number,
    _currency: string,
    _clave: string,
    _consecutivo: string,
    _documentType: number,
    _symbol: string,
    _docDate: Date,
    _docTypeLabel: string,
    _amountApplied?: number,
    _paymentCurrency?: ICurrency
  ) {
    let printingType = await this.getPrintingType();

    let date = new Date();
    let datePrintFormat: string = formatDate(new Date(), 'dd/MM/yyyy h:mm a', 'en');
    let docDatePrintFormat: string = formatDate(_docDate, 'dd/MM/yyyy h:mm a', 'en');
    
    
    `${date.getDate()}/${date.getMonth() + 1
      }/${date.getFullYear()}`;

    switch (printingType) {
      case SupportedPrintingType.ZPL.toString(): {
        return this.DocumentPrintFormatZPL(
          _customer,
          _products,
          _mUnits,
          _companyInfo,
          _vendor,
          _subTotal,
          _discount,
          _tax,
          _total,
          _currency,
          _clave,
          _consecutivo,
          _documentType,
          datePrintFormat,
          _symbol,
          docDatePrintFormat,
          _docTypeLabel,
          _amountApplied,
          _paymentCurrency
        );
      }
      case SupportedPrintingType.PDF.toString():
        return await this.DocumentPrintFormatPDF(
          _customer,
          _products,
          _mUnits,
          _companyInfo,
          _vendor,
          _subTotal,
          _discount,
          _tax,
          _total,
          _currency,
          _clave,
          _consecutivo,
          _documentType,
          datePrintFormat,
          docDatePrintFormat,
          _docTypeLabel,
          _amountApplied,
          _paymentCurrency
        );
    }
  }

  async CreatePaymentPrintFormat(
    _companyInfo: ICompanyInformation,
    _customer: IBusinessPartners,
    _cashTotal: number,
    _cardsTotal: number,
    _userName: string,
    _currency: string,
    _transferTotal: number,
    _docDate: Date,
    _docNum: number,
    _symbol: string,
    _docsInPayment: IDocumentInPayment[]
  ) {
    let printingType = await this.getPrintingType();
    let datePrintFormat = formatDate(new Date(), 'dd/MM/yyyy h:mm a', 'en');
    const FORMATTED_DOCDATE = formatDate(_docDate, 'dd/MM/yyyy h:mm a', 'en');

    switch (printingType) {
      case SupportedPrintingType.ZPL.toString(): {
        return this.PaymentPrintFormatZPL(
          _companyInfo,
          _customer,
          _cashTotal,
          _cardsTotal,
          _userName,
          _currency,
          datePrintFormat,
          _transferTotal,
          FORMATTED_DOCDATE,
          _docNum,
          _symbol,
          _docsInPayment
        );
      }
      case SupportedPrintingType.PDF.toString(): {
        return this.PaymentPrintFormatPDF(
          _companyInfo,
          _customer,
          _cashTotal,
          _cardsTotal,
          _userName,
          _currency,
          datePrintFormat,
          _transferTotal,
          FORMATTED_DOCDATE,
          _docNum,
          _symbol,
          _docsInPayment
        );
      }
      default: {
        return "";
      }
    }
  }

  async getPrintingType() {
    return this.repositoryConfiguration
      .GetConfiguration("PrintingType")
      .then((result) => {
        return result && result.Json
          ? result.Json
          : SupportedPrintingType.ZPL.toString();
      });
  }

  private DocumentPrintFormatZPL(
    customer: BusinessPartnersModel,
    _products: IDocumentLine[],
    _mUnits: IMeasurementUnit[],
    _companyInfo: ICompanyInformation,
    _vendor: string,
    _subTotal: number,
    _discount: number,
    _tax: number,
    _total: number,
    _currency: string,
    _clave: string,
    _consecutivo: string,
    _documentType: number,
    _printDateFormatted: string,
    _symbol: string,
    _docDateFormatted: string,
    _docTypeLabel: string,
    _amountApplied?: number,
    _paymentCurrency?: ICurrency
  ): string {
    let y = 60;
    let docCurrecyCastedSymbol: string = _symbol.replace('₡', '_c2_a2').replace('$', '_24');
    let payCurrencyCastedSymbol: string = _paymentCurrency?.Symbol === '₡' ? '_c2_a2' : '_24';
    let impresion = "";
    impresion += `^XA
      ^LLlabelLength
      ^CI28
      ^CFA,20
      ^FO190,${y}^FD ${_companyInfo.CompanyName} ^FS
      ^FO55,${y + 40}^FD ${_companyInfo.Direction} ^FS
      ^FO200,${y + 80}^FD ${_companyInfo.Phone} ^FS
      ^FO200,${y + 120}^FD ${_companyInfo.Identification} ^FS`;

    y = 220;


    if(_docTypeLabel)
    {
      impresion += `^FO10,${y}^FDTipo documento: ${_docTypeLabel}^FS`;
    }
    

    if (
      _documentType === DocumentType.CreditInvoice ||
      _documentType === DocumentType.CashInvoice ||
      _documentType === DocumentType.ReserveInvoice
    ) {
      impresion += `^FO10,${y + 40}^FDFactura: ${_consecutivo} ^FS
        ^FO10,${y + 80}^FDClave:^FS
        ^FO1,${y + 120}^FD${_clave} ^FS`;

      y += 120;
    }

    y += 40;

    impresion += `^CFA,20
      ^FO10,${y}^FDFecha del documento:  ${_docDateFormatted} ^FS
      ^FO10,${y + 40}^FDFecha de imp.:  ${_printDateFormatted} ^FS
      ^FO10,${y + 80}^FDCliente: ${customer.CardCode} ${customer.CardName} ^FS
      ^FO10,${y + 120}^FDCed: ${customer.LicTradNum} ^FS
      ^FO10,${y + 160}^FDTelefono: ${customer.Phone1} ^FS
      ^FO10,${y + 200}^FDCorreo: ${customer.E_mail} ^FS`;

    impresion += `^CFA,20^FO10,${y + 240}^FDVendedor: ${_vendor} ^FS^FO10,${y + 280
      }^GB780,1,3^FS`;

    y += 320;

    _products.forEach((element) => {
      let name = element.ItemName;
      let mUnit = " - [Unidad]";
      let nameSplited = false;
      if (element.UgpEntry && element.UgpEntry > -1 && _mUnits) {
        let salesUnit = _mUnits.find((x) => x.UoMEntry === element.UoMEntry);

        if (salesUnit) mUnit = ` - [${salesUnit.MeasureUnit}]`;
      }

      if (`${name}${mUnit}`.length <= 45) {
        impresion += `^FO10,${y}^FD${name}${mUnit}^FS`;
      } else {
        nameSplited = true;
        impresion += `^FO10,${y}^FD${name.substring(0, 45)}^FS`;
        impresion += `^FO10,${y + 20}^FD${name.substring(45)}${mUnit}^FS`;
      }
      impresion += `^FO10,${y + (nameSplited ? 50 : 30)}^FDC:${element.Quantity
        }^FS ^FO150,${y + (nameSplited ? 50 : 30)}^FDI:${element.TaxCode
        }^FS ^FO260,${y + (nameSplited ? 50 : 30)}^FH^FDP:${ docCurrecyCastedSymbol
        }${element.Price}^FS ^FO400,${y + (nameSplited ? 50 : 30)}^FH^FDT:${docCurrecyCastedSymbol
        }${element.Price * element.Quantity}^FS`;
      y += nameSplited ? 90 : 70;
    });
    impresion += `^FO10,${y}^GB780,1,3^FS`;
    impresion += `^FO10,${y + 10
      }^FD*C=Cantidad, I=Impuesto, P=Precio, T=Total*^FS`;
    y += 50;

    impresion += `^CFA,20^FO250,${y}^FD Subtotal^FS`;
    impresion += `^FO250,${y + 40}^FD Descuento^FS`;
    impresion += `^FO250,${y + 80}^FD Impuesto^FS`;
    impresion += `^FO250,${y + 120}^FD Total^FS`;

    if(_amountApplied)
    {
      impresion += `^FO250,${y + 160}^FD Importe apl.^FS`;
    }

    impresion += `^FO410,${y}^FH^FD ${ docCurrecyCastedSymbol
      }${this.ParseNumber(_subTotal)}^FS`;
    impresion += `^FO410,${y + 40}^FH^FD ${ docCurrecyCastedSymbol
      }${this.ParseNumber(_discount)}^FS`;
    impresion += `^FO410,${y + 80}^FH^FD ${ docCurrecyCastedSymbol
      }${this.ParseNumber(_tax)}^FS`;
    impresion += `^FO410,${y + 120}^FH^FD ${ docCurrecyCastedSymbol
      }${this.ParseNumber(_total)}^FS`;

    if(_amountApplied)
    {
      impresion += `^FO410,${y + 160}^FH^FD ${ payCurrencyCastedSymbol
      }${this.ParseNumber(_amountApplied)}^FS`;
    }

    y += 200;

    impresion += `^CFA,20F
      ^FO100,${y + 40}^GB400,1,1^FS
      ^FO260,${y + 60}^FD FIRMA^FS`;

    if (
      _documentType === DocumentType.SaleOrder ||
      _documentType === DocumentType.SaleOffer ||
      _documentType === DocumentType.Delivery
    ) {
      y += 120;
      impresion += "^CFA,30^FO10," + y + "^FD MUCHAS GRACIAS!^FS^XZ";
      y += 30;
    } else {
      y += 100;
      impresion += `^FO1,${y}^FH^FDAutorizada mediante resolucion N_c2_ba DGT-R-033-2019^FS`;
      impresion += `^FO1,${y + 40}^FDdel 20-06-2019^FS`;
      impresion += `^FO1,${y + 70
        }^FDEsta factura se considera cancelada con el sello^FS`;
      impresion += `^FO1,${y + 100
        }^FDy firma de la empresa y cobrado contra su^FS`;
      impresion += `^FO1,${y + 130
        }^FDrespectivo recibo. No se aceptan devoluciones^FS`;
      impresion += `^FO1,${y + 160
        }^FDni reclamos despues de dos dias de entregado^FS`;
      impresion += `^FO1,${y + 190}^FDel producto^FS`;
      impresion += `^FO1,${y + 220
        }^FDEste no es un documento oficial. Favor verificar^FS`;
      impresion += `^FO1,${y + 250}^FDsu factura electronica^FS`;
      impresion += `^CFA,30^FO100,${y + 300}^FD MUCHAS GRACIAS!^FS^XZ`;
      y += 330;
    }

    impresion = impresion.replace("labelLength", y.toString());

    return impresion;
  }

  private async DocumentPrintFormatPDF(
    _customer: BusinessPartnersModel,
    _products: IDocumentLine[],
    _mUnits: IMeasurementUnit[],
    _companyInfo: ICompanyInformation,
    _vendor: string,
    _subTotal: number,
    _discount: number,
    _tax: number,
    _total: number,
    _currency: string,
    _clave: string,
    _consecutivo: string,
    _documentType: number,
    _printDateFormatted: string,
    _docDateFormatted: string,
    _docTypeLabel: string,
    _amountApplied?: number,
    _paymentCurrency?: ICurrency
  ) {
    let productsInfo = "";
    _products.forEach((element) => {
      let li = "<li><div>";
      let name = element.ItemName;
      let mUnit = " - [Unidad]";
      if (element.UgpEntry && element.UgpEntry > -1 && _mUnits) {
        let salesUnit = _mUnits.find((x) => x.UoMEntry === element.UoMEntry);
        if (salesUnit) mUnit = ` - [${salesUnit.MeasureUnit}]`;
      }
      li += `<p>${name}${mUnit}</p>`;
      li += `<div>
        <span>C:${element.Quantity} - </span>
        <span>I:${element.TaxCode} - </span>
        <span>P:${element.Price} - </span>
        <span>T:${element.Price * element.Quantity}</span>
      </div></div></li>`;

      productsInfo += li;
    });

    let amountAppliedFormat = _amountApplied ? `<h5>Importe aplicado: ${_paymentCurrency?.Id} ${_amountApplied}</h5>` : '';

    let format = `<div>
    <div>
       <h6>${_companyInfo.CompanyName}</h6>
       <h6>${_companyInfo.Direction}</h6>
       <h6>${_companyInfo.Phone}</h6>
       <h6>${_companyInfo.Identification}</h6>
     </div>
    ${_docTypeLabel
        ? `
        <div><p>Tipo de documento: ${_docTypeLabel}</p>
          <p>Factura: ${_consecutivo}</p>
          <p>Clave: ${_clave}</p>
          </div>`
        : ""
      }
    <div>
      <p>Fecha de documento: ${_docDateFormatted}</p>
      <p>Fecha de imp.: ${_printDateFormatted}</p>
      <p>Cliente: ${_customer.CardCode} ${_customer.CardName}</p>
      <p>Telefono: ${_customer.Phone1}</p>
      <p>Email: ${_customer.E_mail}</p>
      <p>Vendedor: ${_vendor}</p>
    </div>
    <hr>
    <div>
      <ul>
      ${productsInfo}
      </ul>
      <div>
        <p>*C=Cantidad, I=Impuesto, P=Precio, T=Total*</p>
      </div>
    </div>
    <hr>
    <div>
      <h5>Subtotal: ${_currency} ${_subTotal}</h5>
      <h5>Impuesto: ${_currency} ${_discount}</h5>
      <h5>Descuento: ${_currency} ${_tax}</h5>
      <h5>Total: ${_currency} ${_total}</h5>
      ${amountAppliedFormat}
    </div>
    <div>
      <h5>FIRMA</h5>

   ${_documentType !== DocumentType.SaleOrder &&
        _documentType !== DocumentType.SaleOffer &&
        _documentType !== DocumentType.Delivery
        ? `<p>Autorizada mediante resolucion N° DGT-R-033-2019 del 20-06-2019. 
       Esta factura se considera cancelada con el sello y firma de la empresa y cobrado contra su respectivo recibo. 
       No se aceptan devoluciones ni reclamos despues de dos dias de entregado el producto.
       Este no es un documento oficial. Favor verificar su factura electronica</p>`
        : ""
      }
    <h5>Muchas gracias!</h5>
    </div>
    <p></p>
    <p></p>
   </div>`;

    const text: string = htmlToText(format, {
      tags: {
        hr: {
          options: {
            length: 80,
          },
        },
      },
    });

    return text;
  }

  private PaymentPrintFormatZPL(
    _companyInfo: ICompanyInformation,
    _customer: IBusinessPartners,
    _cashTotal: number,
    _cardsTotal: number,
    _userName: string,
    _currency: string,
    _printDate: string,
    _transferTotal: number,
    _docDate: string,
    _paymentNumber: number,
    _symbol: string,
    _docsInPayment: IDocumentInPayment[]
  ) {
    let CastSymbol: string = _symbol.replace('₡', '_c2_a2').replace('$', '_24');

    let marginTop: number = 40;
    
    let printFormat: string = `^XA ^LL#LABEL_LENGTH# ^CI28 ^CFA,20 ^FX Primera seccion, datos de la compañia`;

    printFormat += `^FO190,${marginTop}^FD^FS
    ^FO190,${marginTop}^FD^FS`;

    marginTop += 40;
    printFormat += `^FO190,${marginTop}^FD ${_companyInfo.CompanyName} ^FS`;

    marginTop += 20;
    printFormat += `^FO55,${marginTop}^FD ${_companyInfo.Direction} ^FS`;

    marginTop += 20;
    printFormat += `^FO200,${marginTop}^FD ${_companyInfo.Phone} ^FS`;

    marginTop += 40;
    printFormat += `^FO200,${marginTop}^FD ${_companyInfo.Identification} ^FS
      ^CFA,20
      ^FX Segunda seccion, datos del cliente`;

    marginTop += 60;
    printFormat += `^FO10,${marginTop}^FD Fecha de documento: ^FS ^FO260,${marginTop}^FD ${_docDate} ^FS`;

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Fecha de imp.: ^FS ^FO190,${marginTop}^FD ${_printDate} ^FS`

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Cliente: ^FS ^FO130,${marginTop}^FD ${_customer.CardCode} ${_customer.CardName} ^FS`

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Telefono: ^FS ^FO130,${marginTop}^FD ${_customer.Phone1} ^FS`
    
    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Email: ^FS ^FO100,${marginTop}^FD ${_customer.EmailAddress} ^FS`

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Recibo: ^FS ^FO100,${marginTop}^FD ${_paymentNumber} ^FS
      ^FX Tercera seccion, datos del vendedor
      ^CFA,20`;

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Vendedor: ^FS ^FO130,${marginTop}^FD ${_userName} ^FS
      ^FX Cuarta seccion, totales`;

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^GB780,1,3^FS`;
    
    //DOCUMENTOS DEL PAGO

    if(_docsInPayment && _docsInPayment.length)
    {
      marginTop += 40;
      printFormat += `^FO10,${marginTop}^FD Num. documento ^FS ^FO400,${marginTop}^FD Monto aplic. ^FS`
      
      _docsInPayment.forEach(doc => {
        let docCurr: string = doc.SumApplied ?  '_c2_a2' : '_24';
        
        marginTop += 40;
        printFormat += `^FO10,${marginTop}^FD ${doc.DocNum} ^FS ^FO400,${marginTop}^FH^FD ${docCurr}${this.ParseNumber(this.calculationService.RoundTo(doc.SumApplied || doc.AppliedFC))} ^FS`
      });
      
      marginTop += 40;
      printFormat += `^FO10,${marginTop}^GB780,1,3^FS`;
    }

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Efectivo^FS ^${this.RightOffset(_cashTotal + _cardsTotal + _transferTotal)},${marginTop}^FH^FD ${ CastSymbol
      }${this.ParseNumber(this.calculationService.RoundTo(_cashTotal))}^FS`;


    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Tarjeta^FS ^${this.RightOffset(_cashTotal + _cardsTotal + _transferTotal)},${marginTop}^FH^FD ${ CastSymbol
      }${this.ParseNumber(this.calculationService.RoundTo(_cardsTotal))}^FS`;

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Transferencia^FS ^${this.RightOffset(_cashTotal + _cardsTotal + _transferTotal)},${marginTop}^FH^FD ${ CastSymbol
      }${this.ParseNumber(this.calculationService.RoundTo(_transferTotal))}^FS`;

    marginTop += 40;
    printFormat += `^FO10,${marginTop}^FD Total^FS ^${this.RightOffset(_cashTotal + _cardsTotal + _transferTotal)},${marginTop}^FH^FD ${ CastSymbol
    }${this.ParseNumber(this.calculationService.RoundTo(_cashTotal + _cardsTotal + _transferTotal))}^FS`;


    marginTop += 40;
    printFormat += `^FO10,${marginTop}^GB780,1,3^FS
      ^CFA,20`;

    marginTop += 60;
    printFormat += `^FO100,${marginTop}^GB400,1,1^FS`;

    marginTop += 40;
    printFormat += `^FO260,${marginTop}^FD FIRMA^FS`;

    marginTop += 40;
    printFormat += `^FX Final de la factura
      ^CFA,30^FO150,${marginTop}^FD MUCHAS GRACIAS! ^FS^XZ`;
      
    marginTop += 100;

    printFormat = printFormat.replace('#LABEL_LENGTH#', marginTop.toString());

    return printFormat;
  }

  private PaymentPrintFormatPDF(
    _companyInfo: ICompanyInformation,
    _customer: IBusinessPartners,
    _cashTotal: number,
    _cardsTotal: number,
    _userName: string,
    _currency: string,
    _printDate: string,
    _transferTotal: number,
    _docDate: string,
    _paymentNumber: number,
    _symbol: string,
    _docsInPayment: IDocumentInPayment[]
  ) {

    let printFormat = `<div>
        <div>
        <h6>${_companyInfo.CompanyName}</h6>
        <h6>${_companyInfo.Direction}</h6>
        <h6>${_companyInfo.Phone}</h6>
        <h6>${_companyInfo.Identification}</h6>
      </div>
      <div>
        <p>Fecha de documento: ${_docDate}</p>
        <p>Fecha de imp.: ${_printDate}</p>
        <p>Cliente: ${_customer.CardCode} ${_customer.CardName}</p>
        <p>Telefono: ${_customer.Phone1}</p>
        <p>Email: ${_customer.EmailAddress}</p>
        <p>Recibo: ${_paymentNumber}</p>
        <p>Vendedor: ${_userName}</p>
      </div>
      <hr>`;

      if(_docsInPayment && _docsInPayment.length)
      {
        printFormat += `
          <div>
            <p>Num. documento           Monto aplic.</p>
          </div>
        `;

        _docsInPayment.forEach(x => {
          printFormat += `<div>
                            <p>${x.DocNum}              ${x.Currency}${this.calculationService.RoundTo(x.AmountApplied)}</p>
                          </div>`;
        });

        printFormat += '<hr>';
      }

      printFormat += `
      <hr>
      <div>
        <h5>Efectivo: ${_currency} ${_cashTotal}</h5>
        <h5>Tarjeta: ${_currency} ${_cardsTotal}</h5>
        <h5>Trasferencia: ${_currency} ${_transferTotal}</h5>
        <h5>Total: ${_currency} ${_cashTotal + _cardsTotal}</h5>
      </div>
      <hr>
      <div>
      <p>        ---------------------------------------        </p>
        <h5>FIRMA</h5>
        <h5>MUCHAS GRACIAS!</h5>
      </div>
      <p></p>
      <p></p>
    </div>`;

    const text: string = htmlToText(printFormat, {
      tags: {
        hr: {
          options: {
            length: 80,
          },
        },
      },
    });

    return text;
  }

  private ParseNumber(_number: number): string {
    let mapped_value = _number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (!mapped_value.includes('.')) mapped_value += '.00';
    return mapped_value;
  }

  private RightOffset(_number: number): string {
    let rightOffset = 'FO430';
    if (_number > 1000000.00) {
      rightOffset = 'FO390'
    }

    if (_number > 10000000.00) {
      rightOffset = 'FO370'
    }
    return rightOffset;
  }


  private getCurrentTime() {
    const date = new Date();

    const time = `${this.addZero(date.getHours())}:${this.addZero(date.getMinutes())}`;

    return time;
  }

  private addZero(time) {
    if (time < 10) time = `0${time}`;

    return time;
  }
  GenerateCashDEskClosing(Data: ICashDeskClosingLine[], companyInfo: ICompanyInformation): string {
    let date = new Date();
    let datePrintFormat = `${date.getDate()}/${date.getMonth() + 1
      }/${date.getFullYear()}`;
    let format =
      `^XA
    ^LLlabelLength
    ^CI28
    ^CFA,20
    ^FO110,90^FD ${companyInfo.CompanyName} ^FS
    ^FO30,120^FD Cierre de caja por usuario ERA ^FS
    ^FO30,150^FD Detalle ^FS

    ^FO30,210^FD Factura ^FS
    ^FO150,210^FD Recibo ^FS
    ^FO290,210^FD Total ^FS
    ^FO430,210^FD Pagado ^FS
    ^FO10,230^FD ___________________________________________ ^FS
    ^A0N,20,20^FO10,260^FD CREDITO ^FS`;

    let yOffset = 290; // es igual 230 porque es el ultima valor definido
    let total = 0;
    let totalCredit;
    let totalCash = 0;
    let totalTransfer = 0;
    let totalCards = 0;

    Data.filter(e => e.DocumentState == 'CREDITO').forEach(x => {
      const CURRENT_LINE =
        `^FO30,${yOffset}^FD ${x.Factura} ^FS
        ^FO150,${yOffset}^FD ${x.NumRecibo} ^FS
        ^FO290,${yOffset}^FD ${this.ParseNumber(x.Total)} ^FS
        ^FO430,${yOffset}^FD ${this.ParseNumber(x.PaidToDate)} ^FS`;
      total += x.Total;
      format += CURRENT_LINE;
      yOffset += 30;
    });

    totalCredit = total;

    if (total > 0) {
      total = +total.toFixed(2);
      format += `^FO30,${yOffset}^FD Total: ^FS`;
      format += `^A0N,18,18^FO430,${yOffset}^FD ${this.ParseNumber(total)}^FS`;
      yOffset += 30;
    }

    format += `^A0N,20,20^FO10,${yOffset}^FD PAGADO^FS`;
    yOffset += 30;
    if (Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalCash > 0).length > 0) {
      format += `^A0N,18,18^FO10,${yOffset}^FD EFECTIVO ^FS`;
      yOffset += 30;
    }
    total = 0;
    Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalCash > 0).forEach(x => {
      const CURRENT_LINE =
        `^FO30,${yOffset}^FD ${x.Factura} ^FS
        ^FO150,${yOffset}^FD ${x.NumRecibo} ^FS
        ^FO290,${yOffset}^FD ${this.ParseNumber(x.Total)} ^FS
        ^FO430,${yOffset}^FD ${this.ParseNumber(x.PaidToDate)} ^FS`;
      total += x.Total;
      format += CURRENT_LINE;
      yOffset += 30;
    });

    totalCash = total;

    if (total > 0) {
      total = +total.toFixed(2);
      format += `^FO30,${yOffset}^FD Total: ^FS`;
      format += `^A0N,18,18^FO430,${yOffset}^FD ${this.ParseNumber(total)}^FS`;
      yOffset += 30;
    }


    if (Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalCards > 0).length > 0) {
      format += `^A0N,18,18^FO10,${yOffset}^FD TARJETAS ^FS`;
      yOffset += 30;
    }

    total = 0;
    Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalCards > 0).forEach(x => {
      const CURRENT_LINE =
        `^FO30,${yOffset}^FD ${x.Factura} ^FS
        ^FO150,${yOffset}^FD ${x.NumRecibo} ^FS
        ^FO290,${yOffset}^FD ${this.ParseNumber(x.Total)} ^FS
        ^FO430,${yOffset}^FD ${this.ParseNumber(x.PaidToDate)} ^FS`;

      format += CURRENT_LINE;
      yOffset += 30;
    });

    totalCards = total;

    if (total > 0) {
      total = +total.toFixed(2);
      format += `^FO30,${yOffset}^FD Total: ^FS`;
      format += `^A0N,18,18^FO430,${yOffset}^FD ${this.ParseNumber(total)}^FS`;
      yOffset += 30;
    }

    if (Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalTransfer > 0).length > 0) {
      format += `^A0N,18,18^FO10,${yOffset}^FD TRANSFERENCIA ^FS`;
      yOffset += 30;
    }

    total = 0;
    Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalTransfer > 0).forEach(x => {
      const CURRENT_LINE = `
      
        ^FO30,${yOffset}^FD ${x.Factura} ^FS
        ^FO150,${yOffset}^FD ${x.NumRecibo} ^FS
        ^FO290,${yOffset}^FD ${this.ParseNumber(x.Total)} ^FS
        ^FO430,${yOffset}^FD ${this.ParseNumber(x.PaidToDate)} ^FS
      `;
      total += x.TotalTransfer;
      format += CURRENT_LINE;
      yOffset += 30;
    });

    totalTransfer = total;

    if (total > 0) {
      total = +total.toFixed(2);
      format += `^FO30,${yOffset}^FD Total: ^FS`;
      format += `^A0N,18,18^FO430,${yOffset}^FD ${this.ParseNumber(total)}^FS`;
      yOffset += 30;
    }

    if (Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalCheck > 0).length > 0) {

      format += `^A0N,18,18^FO10,${yOffset}^FD CHEQUES ^FS`;
      yOffset += 30;
    }

    total = 0;
    Data.filter(e => e.DocumentState === 'PAGADO' && e.TotalCheck > 0).forEach(x => {
      const CURRENT_LINE = `
      
        ^FO30,${yOffset}^FD ${x.Factura} ^FS
        ^FO150,${yOffset}^FD ${x.NumRecibo} ^FS
        ^FO290,${yOffset}^FD ${this.ParseNumber(x.Total)} ^FS
        ^FO430,${yOffset}^FD ${this.ParseNumber(x.PaidToDate)} ^FS
      `;
      total += x.TotalCheck;
      format += CURRENT_LINE;
      yOffset += 30;
    });

    if (total > 0) {
      total = +total.toFixed(2);
      format += `^FO30,${yOffset}^FD Total: ^FS`;
      format += `^A0N,18,18^FO430,${yOffset}^FD ${this.ParseNumber(total)}^FS`;
      yOffset += 30;
    }

    format += `^FO10,${yOffset}^FD _______________ULTIMA LINEA_________________ ^FS`;
    yOffset += 30;
    if (totalCredit > 0) {
      format += `^FO30,${yOffset}^FD Total a credito ^FS`;
      format += `^A0N,18,18^FO400,${yOffset}^FD ${this.ParseNumber(+totalCredit.toFixed(2))}^FS`;
      yOffset += 30;
    }
    if (totalCash > 0) {
      format += `^FO30,${yOffset}^FD Total en efectivo ^FS`;
      format += `^A0N,18,18^FO400,${yOffset}^FD ${this.ParseNumber(+totalCash.toFixed(2))}^FS`;
      yOffset += 30;
    }
    if (totalCards > 0) {
      format += `^FO30,${yOffset}^FD Total en tarjetas ^FS`;
      format += `^A0N,18,18^FO400,${yOffset}^FD ${this.ParseNumber(+totalCards.toFixed(2))}^FS`;
      yOffset += 30;
    }
    if (totalTransfer) {
      format += `^FO30,${yOffset}^FD Total en trasferencias ^FS`;
      format += `^A0N,18,18^FO400,${yOffset}^FD ${this.ParseNumber(+totalTransfer.toFixed(2))}^FS`;
      yOffset += 30;
    }
    format += `^FO10,${yOffset}^FD ___________________________________________ ^FS`
    yOffset += 30;
    format += `^A0N,20,20^FO170,${yOffset}^FD GRACIAS POR SU VISITA ^FS`
    yOffset += 30;
    format += `^FO10,${yOffset}^FD ___________________________________________ ^FS`
    yOffset += 30;

    format += `^XZ`;

    format = format.replace("labelLength", yOffset.toString());
    return format;
  }

  Print(_data: string) {
    this.bluetoothSerial.isConnected().then(bnext => {
      if (bnext === 'OK') {
        this.bluetoothSerial.write(_data);
      }
      else {

        const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
        this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {


        }, error => {
          this.commonService.alert(AlertType.ERROR, error);
        });
      }
    }).catch(error => {
      console.log(error);
      const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
      this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {

        this.bluetoothSerial.write(_data);
      }, error => {
        console.log(error);
        this.commonService.Alert(
          AlertType.WARNING,
          `Por favor seleccione una impresora`, 
          `Please choose a printer`
        );
      });
    });
  }


  /**
 * Generates a complete offline ZPL print format string by merging stored templates with provided data.
 *
 * @param zplData - The data used to replace placeholders in the ZPL template (document type, lines, etc.).
 * @returns A promise that resolves to the fully assembled ZPL string for offline printing.
 *          Rejects if the print format or company data cannot be obtained or processing fails.
 */
  GeneneratePrintFormatOffline(zplData: IOfflineZPLData): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const [printFormatData, companyData] = await Promise.all([
          this.repositoryPrintFormat.GetPrintFormatZPLOffline(),
          this.repositoryCompanyInformation.GetCompanyInformation()
        ]);

        if (!printFormatData) {
          this.commonService.Alert(AlertType.ERROR, "Formato de impresión no obtenido, por favor sincronice el formato", "Print format not obtained, please synchronize the format");
          return reject("Print format not obtained.");
        }

        if (!companyData) {
          this.commonService.Alert(AlertType.ERROR, "No se obtuvieron los datos de la compañia, por favor sincronice los datos", "Company data was not obtained, please synchronize the data.");
          return reject("Company data not obtained.");
        }

        const userName = this.localStorageService.get(LocalStorageVariables.Session).UserEmail;

        zplData = {
          ...zplData,
          CompanyDirection: companyData.Direction,
          CompanyId: companyData.Identification,
          CompanyName: companyData.CompanyName,
          CompanyPhone: companyData.Phone,
          UserName: userName || '-',
          CurrencySymbol: zplData.CurrencySymbol.replace('₡', '_c2_a2').replace('$', '_24')
        };

        let headerZPL = '';
        let totalMarginHeader = 0;
        let bodyZPL = '';
        let footerZPLWithMargin = '';

        const isInvoice = printFormatData.DocumentsInvoice.includes(zplData.DocumentType);

        headerZPL = this.ReplacePlaceholders(
          isInvoice ? printFormatData.HeaderInvoice : printFormatData.Header,
          zplData
        );

        totalMarginHeader = this.GetLastYFromTemplate(
          isInvoice ? printFormatData.HeaderInvoice : printFormatData.Header
        ) + 40;

        bodyZPL = this.CreateBodyZPL(printFormatData.Body, totalMarginHeader, zplData.DocumentLines);

        const footerZPL = this.ReplacePlaceholders(
          isInvoice ? printFormatData.FooterInvoice : printFormatData.Footer,
          zplData
        );

        footerZPLWithMargin = this.ApplyOffsetToZPL(footerZPL, zplData.DocumentLines.length * 80);

        let fullZPL = `${headerZPL}\n${bodyZPL}\n${footerZPLWithMargin}`;

        let totalLendth = this.GetLastYFromTemplate(fullZPL)

        fullZPL = fullZPL.replace(/#TotalLength#/g, totalLendth.toString());

        resolve(fullZPL);
      } catch (error) {
        this.commonService.Alert(AlertType.ERROR, error, error);
        reject(error);
      }
    });
  }

  /**
 * Extracts the highest Y-coordinate from a ZPL template using the ^FO command.
 *
 * @param template - The ZPL string to scan for ^FO field origin commands.
 * @returns The maximum Y value found in the template, representing the last vertical position used.
 */
  GetLastYFromTemplate(template: string): number {
    const regex = /\^FO\d+,(\d+)/g;
    let match;
    let maxY = 0;

    while ((match = regex.exec(template)) !== null) {
      const y = parseInt(match[1], 10);
      if (y > maxY) {
        maxY = y;
      }
    }

    return maxY;
  }

  /**
 * Replaces placeholder tokens in a template string with corresponding values from the data object.
 *
 * @param template - A string containing placeholders in the format #Key#.
 * @param data - An object containing values for placeholder replacement.
 * @returns The template string with placeholders replaced by actual data values.
 */
  ReplacePlaceholders(template: string, data: { [key: string]: any }): string {
    return template.replace(/#(\w+)#/g, (_, key) => {
      return data[key] !== undefined ? data[key] : `#${key}#`;
    });
  }

  /**
 * Generates the body portion of a ZPL document by applying line-specific data to a ZPL template.
 *
 * @param template - The base body ZPL template containing placeholders for each line.
 * @param marginInit - The initial Y margin to begin positioning text blocks vertically.
 * @param lines - An array of line data objects to be injected into the template.
 * @returns The concatenated ZPL body section composed of repeated template blocks with data injected.
 */
  CreateBodyZPL(template: string, marginInit: number, lines: ILinesToPrint[]) : string{

    const blocks = [];

    let marginIncrement = marginInit;

    lines.forEach((line) => {

      let block = template
                  .replace(/#Margin#/g, marginIncrement.toString())
                  .replace(/#MarginIncrement#/g, (marginIncrement + 60 ).toString());

      marginIncrement += 90;

      line.CurrencySymbol = line.CurrencySymbol.replace('₡', '_c2_a2').replace('$', '_24')

      // Reemplazar los valores en la plantilla
      block = this.ReplacePlaceholders(block, line);
      blocks.push(block);
    });

    return blocks.join('\n');
  }

  /**
   * Applies a vertical Y offset to all ^FO field origin commands in a ZPL template.
   *
   * @param template - The ZPL string where vertical offsets need to be applied.
   * @param offsetY - The amount of pixels to offset each Y value found.
   * @returns The updated ZPL string with Y positions adjusted by the given offset.
   */
  ApplyOffsetToZPL(template: string, offsetY: number): string {
    return template.replace(/\^FO(\d+),(\d+)/g, (match, x, y) => {
      const yNum = parseInt(y, 10);
      return `^FO${x},${yNum + offsetY}`;
    });
  } 

}
