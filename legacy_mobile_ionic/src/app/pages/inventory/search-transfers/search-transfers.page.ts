import {Component} from '@angular/core';
import {ISalesPerson} from "../../../interfaces/i-sales-person";
import {ActionSheetButton, ActionSheetController, IonItemSliding} from "@ionic/angular";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {
  CommonService,
  DocumentService, FileService,
  LocalStorageService,
  LogManagerService,
  PermissionService
} from "../../../services";
import {catchError, finalize, first} from "rxjs/operators";
import {SalesPersonService} from "../../../services/sales-person.service";
import {AlertType, DocumentType, LogEvent} from "../../../common";
import {DocStateEN, DocStateES, PermissionsSelectedModel} from "../../../models";
import {TranslateService} from "@ngx-translate/core";
import {FilterDataComponent} from "../../../components/filter-data/filter-data.component";
import {CustomModalController} from "../../../services/custom-modal-controller.service";
import {InventoryTransferRequestService} from "../../../services/inventory-transfer-request.service";
import {IStockTransferRequest, ITransfersRequests} from "../../../interfaces/i-stock-transfer-request";
import {FormatDate} from "../../../common/function";
import {HeadersData, LocalStorageVariables} from "../../../common/enum";
import {Network} from "@ionic-native/network/ngx";
import {EMPTY, forkJoin, Observable, of, Subscription} from "rxjs";
import {ICLResponse} from "../../../models/responses/response";
import {IFilterKeyUdf} from "../../../interfaces/i-udfs";
import {StockTransferService} from "../../../services/stock-transfer.service";
import {IStockTransfer} from "../../../interfaces/i-stock-transfer";
import {UdfsService} from "../../../services/udfs.service";
import {Router} from "@angular/router";
import {PrintFormatService} from "../../../services/print-format.service";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial/ngx";

@Component({
  selector: 'app-search-transfers',
  templateUrl: './search-transfers.page.html',
  styleUrls: ['./search-transfers.page.scss'],
})
export class SearchTransfersPage {

  currentSegment = 'search';
  docTypeSelected: string = '';
  docNum: number | null = null;
  docState: string = '';
  startDate: string;
  endDate: string;
  controllerToSendRequest: string = '';
  page: number = 0;
  recordsCount: number = 0;
  navigatePage:string = '';
  numberOfLines: number;

  salesPersonSelected: ISalesPerson | null = null;
  subscriptions=  new Subscription();

  salesPerson: ISalesPerson[] = [];
  docStates: any[];
  docList: ITransfersRequests[] = [];
  permissionList: PermissionsSelectedModel[];
  
  
  constructor(private datePicker: DatePicker,
              private commonService: CommonService,
              private salesPersonService: SalesPersonService,
              private translateService: TranslateService,
              private modalCtrl: CustomModalController,
              private logManagerService: LogManagerService,
              private inventoryTransferRequestService: InventoryTransferRequestService,
              private localStorageService: LocalStorageService,
              private network: Network,
              private permissionService: PermissionService,
              private actionSheetController: ActionSheetController,
              private stockTransferService: StockTransferService,
              private udfService: UdfsService,
              private router: Router,
              private documentService: DocumentService,
              private fileService: FileService,
              private printFormatService: PrintFormatService,
              private bluetoothSerial: BluetoothSerial,) { }
  
  
  ionViewWillEnter() {
    this.InitVariable();
    this.SendInitalRequests();
    this.DefineControllerToSendRequest();
  }

  ionViewDidEnter(): void {
    this.subscriptions = new Subscription();

    //Subscripcion escuchar acciones (CopyTo, Duplicate...)
    this.subscriptions.add(this.commonService.eventManager.subscribe(next => {
      if (next === this.numberOfLines) {
        this.router.navigateByUrl(`/${this.navigatePage}`, {replaceUrl: true});
      }
    }));
  }

  /**
   * Filter values are initialized
   * @constructor
   */
  InitVariable(){
    this.permissionList = [...this.permissionService.Permissions];
    this.startDate = new Date().toISOString();
    this.endDate = new Date().toISOString();
    this.docTypeSelected = DocumentType.TransferRequest.toString();
    this.docStates = this.translateService.currentLang === 'es' ? DocStateES : DocStateEN;
    this.docStates = this.docStates.filter(state => state.Id != 'P');
    this.docState = this.docStates[2].Id; // ALL
    this.currentSegment = 'search';
    this.docNum = null;
    this.salesPersonSelected = null;
    this.numberOfLines = -1;
  }

  /**
   * Mthod is for get initial data
   * @constructor
   */
  async SendInitalRequests(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    this.salesPersonService.GetCustomers()
        .pipe(finalize(()=> loader.dismiss()))
        .subscribe({
          next: (callback)=>{
            this.salesPerson = callback.Data || [];
          },
          error: (error)=>{
            this.commonService.alert(AlertType.ERROR, error)
          }
        })
  }
  
    /**
   * Searches sales person, potentially associated with an ion-item-sliding element.
   * @param _slidingSalesPerson The ion-item-sliding element associated with the customer search (if applicable).
   * @constructor
   */
    async SearchSalesPerson(_slidingSalesPerson: IonItemSliding) {
      try {
        let chooseModal = await this.modalCtrl.create({
          component: FilterDataComponent,
          componentProps: {
            inputData: this.salesPerson,
            inputTitle: "INVENTORY.SEARCH PURCHASING MANAGER",
            inputFilterProperties: ['SlpName']
          },
        });
        chooseModal.present();

        chooseModal.onDidDismiss<ISalesPerson>().then((result) => {
          if(result.data){
            this.salesPersonSelected = result.data as ISalesPerson;
          }
        });

      }catch (error) {
        this.commonService.alert(AlertType.ERROR, error);
        this.logManagerService.Log(LogEvent.ERROR, error);
      }finally {
        _slidingSalesPerson?.close();
      }
    }

    
  DefineControllerToSendRequest(){
    switch (this.docTypeSelected){
      case "13":
        this.controllerToSendRequest = 'InventoryTransferRequests';
        break;
      case "14":
        this.controllerToSendRequest = 'StockTransfers';
        break
    }
  }
  
  ChangeDocNum(){
    
  }

  /**
   * This method is used to serach documents
   * @constructor
   */
  async SearchDoc(): Promise<void> {
    let loader = await this.commonService.Loader();
    try {
      loader.present();
      
      this.page = 0;
      this.inventoryTransferRequestService.GetDocuments<ITransfersRequests>(
          this.controllerToSendRequest,
          (this.docNum || 0),
          (this.salesPersonSelected?.SlpCode ?? 0),
          FormatDate(this.startDate),
          FormatDate(this.endDate),
          this.docState,
          this.page,
          10
      ).pipe(
          finalize(() => loader.dismiss())
      ).subscribe(
          {
            next: (callback => {
              if(callback.Data?.length > 0){
                this.docList = callback.Data || [];
                this.currentSegment = 'docList';
                this.recordsCount = +this.localStorageService.data.get(HeadersData.RecordsCount);
                this.localStorageService.data.delete(HeadersData.RecordsCount)
              } else {
                this.commonService.Alert(AlertType.INFO, 'No hay documentos para mostrar', `There's no documents to show`);
              }
            }),
            error: (error)=>{
              this.commonService.alert(AlertType.ERROR, error)
            }
          }
      );
    }catch (error){
      this.commonService.alert(AlertType.ERROR, error);
      loader.dismiss()
    }
   
  }

  /**
   * Get paginated documents on scroll
   * @param _event
   * @constructor
   */
  async SearchMoreDocuments(_event: CustomEvent<void>) {
    try {
      //Validate if all records have already been obtained so as not to consult further
      if (this.docList.length === this.recordsCount) {
        const scroll = _event.target as HTMLIonInfiniteScrollElement;
        scroll.disabled = true;
        return;
      }
      
      this.page++;

      this.inventoryTransferRequestService.GetDocuments<ITransfersRequests>(
          this.controllerToSendRequest,
          (this.docNum ?? 0),
          (this.salesPersonSelected?.SlpCode ?? 0),
          FormatDate(this.startDate),
          FormatDate(this.endDate),
          this.docState,
          this.page,
          10
      ).pipe(
          finalize(() => {
            const scroll = _event.target as HTMLIonInfiniteScrollElement;
            scroll.complete();
          })
      ).subscribe(
          {
            next: (callback => {
              if(callback.Data){
                this.docList.push(...callback.Data || []);
              }
            }),
            error: (error)=>{
              this.commonService.alert(AlertType.ERROR, error)
            }
          }
      );
    }catch (error){
      this.commonService.alert(AlertType.ERROR, error);
    }
  }

  /**
   * This method idenficate element to update change list
   * @param index property index
   * @returns
   */
  TrackByFunction(index) {
    return index;
  }

  /**
   * Validate permissions on document options
   * @param _action
   * @param _docType
   * @constructor
   */
  VerifyPermissionByDocType(_action: 'edit' | 'duplicate' | 'copyTo', _docType?: number) {
    switch (_docType) {
      case DocumentType.TransferRequest:
        if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Inventory_SearchTransfers_EditTransferRequest');
        if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Inventory_SearchTransfers_DuplicateTransferRequest');
        if (_action === 'copyTo') return this.permissionList.some(p => p.Name === 'M_Inventory_SearchTransfers_CopyInventoryTransfer');
        return false;
      case DocumentType.InventoryTransfer:
        if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Inventory_SearchTransfers_EditInventoryTransfer');
        if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Inventory_SearchTransfers_DuplicateInventoryTransfer');
        return false;
    }
  }

  /**
   * This method is used to get navigation page
   * @constructor
   * @private
   */
  private GetPage():string{

    if(+this.docTypeSelected === DocumentType.TransferRequest){
      return 'transfer-request';
    }

    if(+this.docTypeSelected === DocumentType.InventoryTransfer){
      return 'inventory-transfer';
    }

    return '';
  }

  /**
   * This method is for obtained detail data
   * @param doc
   * @param action
   * @constructor
   */
  async SearchDocLines(doc: ITransfersRequests, action: 'edit' | 'duplicate' | 'copy'): Promise<void> {
    let loader = await this.commonService.Loader();
    
    loader.present();

    let linesObservable: Observable<ICLResponse<IStockTransferRequest | IStockTransfer>>;

    let table: string = '';
    switch (+this.docTypeSelected) {
      case DocumentType.TransferRequest:
        table = 'OWTQ';
        linesObservable = this.inventoryTransferRequestService.Get(doc.DocEntry, action);
        break;
      case DocumentType.InventoryTransfer:
        table = 'OWTR';
        linesObservable = this.stockTransferService.Get(doc.DocEntry, action);
        break;
      default:
        linesObservable = EMPTY;
    }

    this.subscriptions.add(forkJoin({
      Document: linesObservable,
      UdfsValues: this.udfService.GetUdfsData({
        DocEntry: doc.DocEntry,
        TypeDocument: table
      } as IFilterKeyUdf).pipe(catchError(error => of(null)))
    }).pipe(finalize(() => loader.dismiss()))
        .subscribe({
          next: async (data) => {
    
            if (data.Document && data.Document.Data.StockTransferLines.length > 0) {
              if (data.UdfsValues) {
                data.Document.Data.Udfs = data.UdfsValues.Data;
              }
              this.numberOfLines = data.Document.Data.StockTransferLines.length;
              this.localStorageService.data.set(LocalStorageVariables.DocumentToEdit, data.Document.Data);
              
              // Actualizamos el observable para matener la cuenta de los items
              this.commonService.eventManager.next(data.Document.Data.StockTransferLines.length);
              
            } else {
              this.commonService.alert(AlertType.INFO, 'No se obtuvieron registros.');
            }
    
          },
          error: (error: any) => {
            this.commonService.alert(AlertType.ERROR, error);
            this.localStorageService.data.delete(LocalStorageVariables.IsActionCopyTo);
    
            this.localStorageService.data.delete(LocalStorageVariables.IsActionDuplicate);
            
            this.localStorageService.data.delete(LocalStorageVariables.IsEditionMode);
            
          }
    }));
  }

  /**
   * Muestra las opciones que se le pueden aplicar al documento
   * @param Document model filter
   * @constructor
   */
  async ShowDocsOptions(Document: ITransfersRequests): Promise<void> {
    
    if ([this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type)) {
      this.commonService.Alert(AlertType.INFO, 'Debes tener conexión a internet para realizar estas acciones', 'You must have an Internet connection to perform these actions');
      return;
    }

    const EDIT_BUTTON: ActionSheetButton = {
      text: this.commonService.Translate(
          `Editar`,
          `Edit`
      ),
      icon: 'create',
      handler: async () => {
        if (Document.DocStatus === 'Cerrado') {
          this.commonService.Alert(AlertType.INFO, 'Documento en estado cerrado', 'Document in closed state');
          return;
        }
        
        if (!this.VerifyPermissionByDocType('edit', +this.docTypeSelected)) {
          let message = this.commonService.Translate('No tienes permisos para realizar esta acción', 'You do not have permissions to performs this action');
          this.commonService.toast(message, 'dark', 'bottom');
          return;
        }

        this.localStorageService.data.set(LocalStorageVariables.DocumentType, this.docTypeSelected);
        this.localStorageService.data.set(LocalStorageVariables.IsEditionMode, true);
        this.navigatePage = this.GetPage();
        await this.SearchDocLines(Document, 'edit');
      }
    }

    const COPY_TO: ActionSheetButton = {
      text: this.commonService.Translate('Copiar a', 'Copy to'),
      icon: 'documents',
      handler: async () => {
        if (Document.DocStatus === 'Cerrado') {
          this.commonService.Alert(AlertType.INFO, 'Documento en estado cerrado', 'Document in closed state');
          return;
        }

        this.localStorageService.data.set(LocalStorageVariables.IsActionCopyTo, true);
        this.ShowCopyOptions(Document);
      }
    }

    const BUTTONS_DUPLICATE: ActionSheetButton =
        {
          text: this.commonService.Translate(
              `Duplicar`,
              `Duplicate`
          ),
          icon: 'duplicate-outline',
          handler: async () => {
            if (!this.VerifyPermissionByDocType('duplicate', +this.docTypeSelected)) {
              let message = this.commonService.Translate('No tienes permisos para realizar esta acción', 'You do not have permissions to performs this action');
              this.commonService.toast(message, 'dark', 'bottom');
              return;
            }

            this.localStorageService.data.set(LocalStorageVariables.DocumentType, this.docTypeSelected);
            this.localStorageService.data.set(LocalStorageVariables.IsActionDuplicate, true);
            this.navigatePage = this.GetPage();
            await this.SearchDocLines(Document, "duplicate");
          }
        };

    const BUTTONS: ActionSheetButton[] = [
      {
        text: this.commonService.Translate(
            `Pre-visualizar`,
            `Pre-view`
        ),
        role: 'destructive',
        icon: 'information-circle',
        handler: async () => {
          if (!this.permissionList.some(p => p.Name === 'M_Inventory_SearchTransfers_PreviewDocument')) {
            let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
            this.commonService.toast(message, 'dark', 'bottom');
            return;
          }
          await this.OnClickPreview({ DocEntry: Document.DocEntry });
        }
      },
      {
        text: this.commonService.Translate(
            `Imprimir`,
            `Print`
        ),
        icon: 'print',
        handler: async () => {
          await this.RequestDocumentToPrint(Document.DocEntry);
        }
      },
      {
        text: this.commonService.Translate(
            `Cancelar`,
            `Cancel`
        ),
        icon: 'close',
        role: 'cancel',
        handler: () => {

        }
      }
    ]

    if (+this.docTypeSelected === DocumentType.InventoryTransfer || +this.docTypeSelected === DocumentType.TransferRequest) {
      BUTTONS.push(EDIT_BUTTON);
      BUTTONS.push(BUTTONS_DUPLICATE);
    }

    if (+this.docTypeSelected === DocumentType.TransferRequest) {
      BUTTONS.push(COPY_TO);
    }

    const actionSheet = await this.actionSheetController.create({
      header: this.commonService.Translate('Opciones', 'Options'),
      cssClass: '',
      buttons: BUTTONS
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
  }

  /**
   * Load options actions for an dcument
   * @param _document
   * @constructor
   */
  async ShowCopyOptions(_document: ITransfersRequests): Promise<void> {

    const COPY_OPTIONS: ActionSheetButton[] = [
      {
        text: this.commonService.Translate(`Transferencia de stock`, `Stock transfer`),
        icon: "bus-outline",
        role: "",
        handler: async () => {
          if (!this.VerifyPermissionByDocType('copyTo', DocumentType.TransferRequest)) {
            let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
            this.commonService.toast(message, 'dark', 'bottom');
            return;
          }

          this.navigatePage = 'inventory-transfer';
          await this.SearchDocLines(_document, "copy");
        }
      },
      {
        text: this.commonService.Translate(
            `Cancelar`,
            `Cancel`
        ),
        icon: 'close-outline',
        role: "",
        handler: () => {
          this.localStorageService.data.delete(LocalStorageVariables.IsActionCopyTo);
          this.navigatePage = '';
          this.ShowDocsOptions(_document);
        }
      }
    ];

    const actionSheet = await this.actionSheetController.create({
      buttons: [...COPY_OPTIONS],
      header: this.commonService.Translate("Copiar a", "Copy to"),
      backdropDismiss: false
    });

    await actionSheet.present();

    await actionSheet.onDidDismiss();
  }

  /**
   * This is used preview document
   * @param data
   * @returns
   */
  async OnClickPreview(data: any): Promise<void> {
    if (this.network.type === "none") return;

    let controller: string = '';

    if (+this.docTypeSelected === DocumentType.TransferRequest) {
      controller = 'ReprintTransferRequest';
    } else if (+this.docTypeSelected === DocumentType.InventoryTransfer) {
      controller = 'InventoryTransfer';
    } else {
      return;
    }

    let loader = await this.commonService.Loader();
    loader.present();

    this.subscriptions.add(this.documentService
        .DocumentPreview(data.DocEntry, controller)
        .pipe(
            first(),
            finalize(() => loader.dismiss())
        ).subscribe({
          next: (callback) => {
            if (callback.Data) {
              this.fileService
                  .writeFile(callback.Data.Base64, `Doc-${data.DocEntry}`)
                  .then((result) => {
                    this.fileService.openPDF(result.nativeURL);
                  });
            }
          },
          error: (error) => {
            this.commonService.toast(error, 'dark', 'bottom');
          }
        }));
  }

  /**
   * This method is used to print zpl
   * @param _docEntry represent model filter
   */
  async RequestDocumentToPrint(_docEntry: number): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();
    this.subscriptions.add(
        this.printFormatService.GetDocumentPrintFormat(_docEntry, 0, +this.docTypeSelected, 0, '')
            .pipe(finalize(() => loader.dismiss()))
            .subscribe({
              next: async (callback) => {

                this.bluetoothSerial.isConnected().then(bnext => {
                  if (bnext === 'OK') {
                    this.Print(callback.Data.PrintFormat);
                  } else {
                    const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
                    this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {
                          this.Print(callback.Data.PrintFormat);
                        },
                        (error) => {
                          this.commonService.alert(AlertType.ERROR, error);
                        });
                  }
                }).catch(error => {
                  const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
                  this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {
                        this.Print(callback.Data.PrintFormat);
                      },
                      (error) => {
                        this.commonService.alert(AlertType.WARNING, `Por favor seleccione la impresora. ${error}`);
                      });
                });
              },
              error: (error) => {
                console.error(error);
                this.commonService.Alert(AlertType.ERROR, error, error);
              }
            }));
  }

  Print(_data: string): void {
    try {
      this.bluetoothSerial.write(_data);
    } catch (error) {
      console.log(error);
    }
  }




  /**
   * Assign the selected date to the corresponding field
   * @param _dateTypeField
   * @constructor
   */
  ShowDatePicker(_dateTypeField: string): void {
    this.datePicker
        .show({
          date: new Date(),
          mode: "date",
          androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
        })
        .then((date) => {
          switch (_dateTypeField) {
            case 'StartDate':
              this.startDate = date.toISOString()
              break;
            case 'EndDate':
              this.endDate = date.toISOString()
              break;
          }
        });
  }
  
  
  GetStatusName(_status: string): string {
    if(this.translateService.currentLang === 'es'){
     return  DocStateES.find(status=> status.Id == _status).Name || ''
    } 
    return DocStateEN.find(status=> status.Id == _status).Name || '';
  }

  
  

}
