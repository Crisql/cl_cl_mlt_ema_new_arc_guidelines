import {DatePipe} from "@angular/common";
import {Component, OnDestroy, OnInit} from "@angular/core";
import {Network} from "@ionic-native/network/ngx";
import {LoadingController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin, of, Subscription} from "rxjs";
import {AlertType, DocumentType} from "src/app/common";
import {IDocumentToSync} from "src/app/models";
import {BackupManagerService} from '../../services/backup-manager.service';
import {CommonService, LocalStorageService, Repository,} from "src/app/services";
import {IOfflineDocument, IOfflineDocumentHandler} from "../../models/db/i-offline-document";
import {catchError, finalize, map} from "rxjs/operators";
import {DocumentSyncStatus, DocumentTypeAcronyms, LocalStorageVariables, SettingCodes} from "../../common/enum";
import {SettingsService} from "../../services/settings.service";
import {IDecimalSetting} from "../../interfaces/i-settings";
import {ICompany} from "../../models/db/companys";

@Component({
  selector: "app-document-upload",
  templateUrl: "./document-upload.page.html",
  styleUrls: ["./document-upload.page.scss"],
  providers: [DatePipe],
})
export class DocumentUploadPage implements OnInit, OnDestroy {
  documents: IOfflineDocument[];
  documentHandlerList: IOfflineDocumentHandler[] = [];
  documentTransaction$: Subscription;
  showAllDocuments: boolean;
  companyDecimals: IDecimalSetting;
  toFixedTotalDocument: string;
  constructor(
    private translateService: TranslateService,
    private loadingController: LoadingController,
    private datePipe: DatePipe,
    private repositoryDocument: Repository.Document,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    public network: Network
    , private backupManagerService: BackupManagerService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.showAllDocuments = false;
    this.GetLocalDocuments();
    this.documentTransaction$ = this.commonService.documentTransactionManager.subscribe(_=> this.GetLocalDocuments(), _=> this.GetLocalDocuments());
  }

  ngOnDestroy(): void {
    if (this.documentTransaction$) this.documentTransaction$.unsubscribe();
  }

  /**
   * Retrieves all local documents
   * @constructor
   */
  async GetLocalDocuments(_allDocuments: boolean = false): Promise<void> 
  {
    this.documents = [];

    let loader = await this.loadingController.create({
      message: this.commonService.Translate('Procesando...', 'Processing...'),
    });

    loader.present();

    forkJoin([
        this.settingsService.GetSettingByCode(SettingCodes.Decimal).pipe(catchError(error => of(null))),
        this.repositoryDocument.GetAllDocuments()
            .pipe(
                map(documents => documents.filter(doc => this.showAllDocuments || doc.TransactionStatus === DocumentSyncStatus.NotSynchronized))
            )
    ])
        .pipe(
            finalize(() => loader.dismiss())
        )
        .subscribe({
          next: (callbacks) => {
            if (callbacks && callbacks[0] && callbacks[0].Data) 
            {
              let settings = callbacks[0].Data;
              
              let companyDecimal: IDecimalSetting[] = JSON.parse(settings.Json || '');

              if (companyDecimal && companyDecimal.length > 0) 
              {
                let company = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany;
                
                let decimalCompany = companyDecimal.find(x => x.CompanyId === company?.Id) as IDecimalSetting;
                
                if (decimalCompany) 
                {
                  this.companyDecimals = decimalCompany;
                  
                  this.toFixedTotalDocument = `1.${this.companyDecimals?.TotalDocument}-${this.companyDecimals?.TotalDocument}`;
                }
              }
            }
            
            this.documents = callbacks[1];
          },
          error: (error) => {
            this.commonService.Alert(AlertType.ERROR, error, error);
          }
        });
  }

  /**
   * Get the value of a raw document property
   * @param _rawDocument The raw document to get the value
   * @param _property The name of the property
   * @constructor
   */
  GetRawDocumentPropertyValue(_rawDocument: string, _property: string): any
  {
    let doc: IDocumentToSync = JSON.parse(_rawDocument);
    
    return doc.Document[_property];
  }

  /**
   * Get the name of the offline document based on its document type property
   * @param _offlineDocument
   * @constructor
   */
  GetDocTitle(_offlineDocument: IOfflineDocument): string 
  {
    switch (_offlineDocument.DocumentType) 
    {
      case DocumentTypeAcronyms.Invoice:
        return this.commonService.Translate('Factura a crédito', 'Credit invoice');
      case DocumentTypeAcronyms.InvoiceWithPayment:
        return this.commonService.Translate('Factura a contado', 'Cash invoice');
      case DocumentTypeAcronyms.SaleOrder:
        return this.commonService.Translate('Orden de venta', 'Sale order');
      case DocumentTypeAcronyms.SaleQuotation:
        return this.commonService.Translate('Oferta de venta', 'Sale offer');
      default:
        return this.commonService.Translate('No definido', 'Undefined');
    }
  }

  /**
   * Show the document synchronization result
   * @param _offlineDocument The offline document information
   * @constructor
   */
  ShowDocumentInformation(_offlineDocument: IOfflineDocument):void 
  {
    if(!_offlineDocument.TransactionDetail) return;
    
    let message = _offlineDocument.TransactionDetail;

    this.commonService.alert(AlertType.INFO, message,
      this.commonService.Translate("Detalle documento #" + _offlineDocument.Id, "Detail of document #" + _offlineDocument.Id)
    );
  }

  /**
   * Execute the method that send the not synchronized documents to the remote database
   * @constructor
   */
  RefreshLocalDocumentsTransactionStatus(): void {
    try {
      this.localStorageService.SetIsBackingUpDocuments(true);

      this.backupManagerService.RequestDocumentsBackUp();
    }
    catch (error) {
      console.warn(error);
    }
  }

  /**
   * Emit an event to show all documents if the response of the user is true
   * @constructor
   */
  async ShowCommittedDocuments(): Promise<void> 
  {
    if(!this.showAllDocuments)
    {
      this.commonService.Alert(
          AlertType.QUESTION,
          `Mostrar todos los documentos almacenados`,
          `Show all stored documents`,
          'Confirmación',
          'Confirmation',
          [
            {
              text: this.commonService.Translate(`Cancelar`, `Cancel`),
              role: "cancel",
              handler: _=> {
                this.localStorageService.SetModalBackupStatus(false);
                this.showAllDocuments = false;
                this.commonService.documentTransactionManager.next();
              }
            },
            {
              text: this.commonService.Translate(`Continuar`, `Continue`),
              handler: _=> {
                this.showAllDocuments = true;
                this.commonService.documentTransactionManager.next();
              },
            },
          ],
      );
    }
    else
    {
      this.commonService.documentTransactionManager.next();
    }
  }
}


