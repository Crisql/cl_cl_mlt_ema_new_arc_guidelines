import {AlertType, DocumentType, SupportedPrintingType} from './../../common/enum';
import {Component, Input, OnInit} from "@angular/core";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial/ngx";
import {Network} from "@ionic-native/network/ngx";
import {PopoverController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
import {finalize, first} from "rxjs/operators";
import {CommonService, DocumentService, FileService, LocalStorageService, PrintingService,} from "src/app/services";
import {IDocumentCreateComponentInputData} from "../../models/db/i-modals-data";
import {htmlToText} from "html-to-text";

@Component({
  selector: "app-document-created",
  templateUrl: "./document-created.component.html",
  styleUrls: ["./document-created.component.scss"],
})
export class DocumentCreatedComponent implements OnInit {
  @Input("data") data: IDocumentCreateComponentInputData;
  title: string;
  print: string;
  preview: string;
  docType: number;

  constructor(
    private popoverController: PopoverController,
    private bluetoothSerial: BluetoothSerial,
    private translateService: TranslateService,
    private documentService: DocumentService,
    private commonService: CommonService,
    private network: Network,
    private fileService: FileService,
    private localStorageService: LocalStorageService,
    private PrintingService: PrintingService
  ) { }

  ngOnInit() {
    
    if (!this.data?.Edit) {
      this.title = this.commonService.Translate('Documento creado', 'Document created') 
    } else {
      this.title = this.commonService.Translate('Documento actualizado`', 'Document updated') 
    }
    
    this.docType = this.data.DocType;
    this.print = this.translateService.currentLang === "es" ? "Imprimir" : "Print";
    this.preview =
      this.translateService.currentLang === "es" ? "V. previa" : "Preview";

    if (this.data.AllowPrint) {
      this.Print(this.data.PrintInformation);
    }

  }

  /**
   * Validate the connection with a printer
   */
  printDocument() {
    try {
      this.bluetoothSerial.isConnected().then(bnext => {
        if (bnext === 'OK') {
          this.Print(this.data.PrintInformation);
        } else {
          const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
          this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {
                this.Print(this.data.PrintInformation);
              },
              (error) => {
                this.commonService.alert(AlertType.ERROR, error);
              });
        }
      }).catch(error => {
        const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
        this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {
              this.Print(this.data.PrintInformation);
            },
            (error) => {
              this.commonService.alert(AlertType.WARNING, `Por favor seleccione la impresora. ${error}`);
            });
      });
    }catch (err){
      this.commonService.alert(AlertType.ERROR, err);
    }
    
  }

  /**
   * Send the document to print
   * @param _data
   * @constructor
   */
  Print(_data: string): void {
    this.PrintingService.getPrintingType().then(printingType => {
      let print = '';

      switch (printingType) {
        case SupportedPrintingType.PDF.toString():
          print = htmlToText(_data, {
            tags: {
              hr: {
                options: {
                  length: 80,
                },
              },
            },
          });
          break;
        case SupportedPrintingType.ZPL.toString():
          print = _data;
          break;
      }

      try {
        this.bluetoothSerial.write(print);
      } catch (error) {
        console.log(error);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  async onClickPreview() {
    if (this.network.type === "none") return;


    let controller: string = '';
    
    if(this.data.IsPreliminary){
      controller = 'Preliminary';
    }else if (this.docType === DocumentType.CashInvoice) {
      controller = 'Invoices';
    } else if (this.docType === DocumentType.CreditInvoice) {
      controller = 'Invoices';
    } else if (this.docType === DocumentType.ReserveInvoice) {
      controller = 'ReserveInvoice';
    } else if (this.docType === DocumentType.Delivery) {
      controller = 'DeliveryNotes';
    } else if (this.docType === DocumentType.SaleOrder) {
      controller = 'SaleOrder';
    }else if (this.docType === DocumentType.SaleOffer) {
      controller = 'SaleOffer';
    }else if (this.docType === DocumentType.CreditNotes) {
      controller = 'CreditNote';
      this.data.DocEntry = parseInt(this.data.DocNum);
    }else {
      return;
    }


    let loader = await this.commonService.Loader();
    loader.present();

    this.documentService
      .DocumentPreview(this.data.DocEntry, controller)
      .pipe(
        first(),
        finalize(() => loader.dismiss())
      ).subscribe({
        next: (callback) => {
          if (callback.Data) {
            this.fileService
              .writeFile(callback.Data.Base64, `Doc-${this.data.DocEntry}`)
              .then((result) => {
                this.fileService.openPDF(result.nativeURL);
              });
          }
        },
        error: (error) => {
          this.commonService.toast(error, 'dark', 'bottom');
        }
      });
  }
}
