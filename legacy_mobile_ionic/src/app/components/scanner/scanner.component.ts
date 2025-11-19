import {Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {QRScanner, QRScannerStatus} from "@ionic-native/qr-scanner/ngx";
import {AlertType, DiscountsType, LogEvent} from "../../common";
import {CommonService, LocalStorageService, LogManagerService, ProductService} from "../../services";
import {IProductSearchComponentInputData} from "../../models/db/i-modals-data";
import {IItem} from "../../models/i-item";
import {catchError, concatMap, finalize, switchMap} from "rxjs/operators";
import {ISalesTaxes} from "../../interfaces/i-sales-taxes";
import {IDocumentLine, ISelectedProducts, IUoMmasterData} from "../../interfaces/i-item";
import {DiscountGroup, DiscountHierarchy, IBlanketAgreement} from "../../models";
import {CLMathRound} from "../../common/function";
import {EMPTY, forkJoin, of, Subject, Subscription} from "rxjs";
import {IValidateInventory, IValidateInventorySetting} from "../../interfaces/i-settings";
import {SettingsService} from "../../services/settings.service";
import {Network} from "@ionic-native/network/ngx";
import {BatchSerial, LocalStorageVariables, SettingCodes, ViewType} from "../../common/enum";
import {ICompany} from "../../models/db/companys";
import {IDocumentLinesBinAllocations, ISerialNumbers} from "../../interfaces/i-batches";
import {TranslateService} from "@ngx-translate/core";
import {ModalController, Platform} from "@ionic/angular";

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss'],
})
export class ScannerComponent implements OnInit, OnChanges, OnDestroy{
  
  @Input() isDisabled: boolean = false;

  @Input('data') data: IProductSearchComponentInputData;

  @Input('productsSelected') productsSelected: IDocumentLine[];

  @Output() scanStatus = new EventEmitter<boolean>();

  @Output() scannedItem = new EventEmitter<ISelectedProducts>();

  private onScanCode$ = new Subject<string>();
  
  scannedCode: string = '';

  requestingItem: boolean = false;


  itemSelected: IDocumentLine[] = [];
  blanketAgreementNames: string[] = [];
  searchTerm: string;
  table: string = '';

  currency: string;
  expanded = false;
  blanketAgreement: IBlanketAgreement[] = [];
  validatInventory: IValidateInventory[] = [];

  backButtonSubscription: Subscription;

  constructor(private qrScannerService: QRScanner,
              private commonService: CommonService,
              private productService: ProductService,
              private logManagerService: LogManagerService,
              private settingsService: SettingsService,
              private localStorageService: LocalStorageService,
              private network: Network,
              private translateService: TranslateService,
              private platform: Platform,
              private modalController: ModalController) {}

  ngOnInit() {
    this.LoadProducts();

    //An event is recorded to listen for the mobile back action
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      this.scanStatus.emit(false)
      this.qrScannerService.hide();
      this.qrScannerService.destroy();
    });
    
    this.ListenScan();
  }

  ngOnDestroy() {
    this.backButtonSubscription?.unsubscribe();
    this.qrScannerService?.hide();
    this.qrScannerService?.destroy();
    this.onScanCode$?.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.blanketAgreement = this.data.BlanketAgreements;

      this.table = this.data.DocumentTable;

      if (!this.blanketAgreement) this.blanketAgreement = [];
      
    }
  }

  
  /**
   * This method is used to load products
   * @constructor
   */
  async LoadProducts(): Promise<void> {
    
    let loader = await this.commonService.Loader();

    loader.present();

    forkJoin({
      Setting: [this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type) ? of(null) : this.settingsService.GetSettingByCode(SettingCodes.ValidateInventory)
    }).pipe(
        finalize(() => loader.dismiss())
    ).subscribe(
        responses => {

          if(responses.Setting)
          {
            let company = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany;

            let settings: IValidateInventorySetting[] = JSON.parse(responses.Setting?.Data?.Json || '[]');

            this.validatInventory = settings?.find(element => element.CompanyId === company?.Id)?.Validate ?? [] as IValidateInventory[];
          }
        }, error => {
          this.commonService.Alert(AlertType.ERROR, error, error);

          this.logManagerService.Log(
              LogEvent.ERROR,
              error
          );
        });
  }

  /**
   * Handles keyboard input events for scanning purposes.
   * 
   * @param _event KeyboardEvent triggered by a key press.
   */
  @HostListener('window:keydown', ['$event'])
  async HandleScannerInput(_event: KeyboardEvent): Promise<void> {

    if(this.requestingItem){
      return;
    }
    
    if(this.isDisabled){
      return;
    }
    if(await this.modalController.getTop())
    {
      return;
    }

    if (_event.key === 'Enter') {
      this.onScanCode$.next(this.scannedCode);
      this.scannedCode = '';
    }
    else if (_event.key.length === 1) {
      this.scannedCode += _event.key;
    }
  }

  /**
   * Listens for scan events and processes scanned codes. For each scanned code:
   */
  async ListenScan() {
    let loader: HTMLIonLoadingElement;
    this.onScanCode$
        .pipe(
            switchMap(async (scannedCode) =>{
              loader = await this.commonService.Loader();
              loader.present();
              
              return scannedCode
            }),
            concatMap(  (scannedCode)  => {
              
              this.requestingItem = true;
              if(this.ItemExistInDocumentLines(scannedCode))
              {
                loader.dismiss();
                this.requestingItem = false;
                return EMPTY;
              }

              return of(scannedCode);
            }),
            concatMap((scannedCode)=> {
              if(scannedCode && scannedCode != ' '){
                return this.productService.GetItemDetail(scannedCode, this.data.UserWarehouse, this.data.DocumentTable, this.data.DocType, 0, this.data.PriceListNum, ViewType.SellItem);
              }

              return of(null);
            }),
            catchError((err) => {
              loader.dismiss();
              this.requestingItem = false;
              this.commonService.alert(AlertType.ERROR, err);
              return of(null)
            })
        )
        .subscribe({
          next: (response)=>{
            loader.dismiss();
            this.requestingItem = false;
            this.ProcessItemScanner(response?.Data || null);
          },
          error: (err)=>{
            this.commonService.alert(AlertType.ERROR, err);
          }
        });
  }

  /**
   * Checks if an item with the specified code exists in the document lines.
   * @param _itemCode The code of the item to search for in the document lines.
   * @returns `true` if the item exists, `false` otherwise.
   */
  ItemExistInDocumentLines(_itemCode: string): boolean{
    let documentLine = this.productsSelected.slice().reverse().find(dl => dl.ItemCode == _itemCode);
    
    if(documentLine){
      const result: ISelectedProducts = {
        Items: [{...documentLine, Quantity: 1}],
        BatchedItems: [],
        BlanketAgreementName: this.blanketAgreementNames
      } as ISelectedProducts;
      
      this.scannedItem.emit(result);
      
      return true;
    }
    return false;
  }

  /**
   * Filters discounts based on two dynamic properties and their expected values.
   *
   * @param propertyOne - The first property to filter by.
   * @param expectedValueOne - The expected value for the first property.
   * @param propertyTwo - The second property to filter by.
   * @param expectedValueTwo - The expected value for the second property.
   * @returns A DiscountGroup that matches the provided criteria or an empty DiscountGroup if none is found.
   */
  FilterDiscountsDynamic(
      propertyOne: string,
      expectedValueOne: any,
      propertyTwo: string,
      expectedValueTwo: any
  ): DiscountGroup {
    if (!this.data.Discounts) return {} as DiscountGroup;

    let discountGroup: DiscountGroup;

    discountGroup = this.data.Discounts.find((x) => x[propertyOne] == expectedValueOne && x[propertyTwo] == expectedValueTwo);

    return discountGroup ?? {} as DiscountGroup;
  }


  /**
   * This method check the discount hierarchy and blanket agreements to applied a discount to the document line
   * @param _documentLine The document line where the discount should be applied
   * @constructor
   */
  ApplyDiscountOrBlanketAgreement(_documentLine: IDocumentLine): void {

    let hasSomeBlanketAgreement: boolean = this.blanketAgreement && this.blanketAgreement.length > 0;

    let hasDiscountHierarchy: boolean = this.data.DiscountHierarchy && this.data.DiscountHierarchy.length > 0;

    if (hasDiscountHierarchy)
    {
      let excludeProductFromBlanketAgreement: boolean = true;

      let productHasBlanketAgreement: boolean = hasSomeBlanketAgreement && this.blanketAgreement.some(p => p.Lines.some(pl => pl.ItemCode === _documentLine.ItemCode));

      this.data.DiscountHierarchy = this.data.DiscountHierarchy.sort((x, y) => x.Hierarchy - y.Hierarchy);

      let discount: number;

      let discountGroup: DiscountGroup;

      let discountFound: boolean = false;

      let blanketAgreementApplied: boolean = false;

      for (let i = 0; i < this.data.DiscountHierarchy.length && (!discountFound && !blanketAgreementApplied); i++)
      {
        let discountHierarchy: DiscountHierarchy = this.data.DiscountHierarchy[i];

        discount = null;

        discountGroup = null;

        switch (discountHierarchy.Type) {
          case DiscountsType.BP:
            discount = this.data.CustomerDiscount;
            break;
          case DiscountsType.BPGroupXItem:
            discountGroup = this.FilterDiscountsDynamic(
                'BPGroup',
                this.data.CustomerGroup,
                "ItemCode",
                _documentLine.ItemCode
            );
            discount = discountGroup.Discount;
            break;
          case DiscountsType.BPGroupXItemGroup:
            discountGroup = this.FilterDiscountsDynamic(
                'BPGroup',
                this.data.CustomerGroup,
                'ItemGroup',
                _documentLine.GroupCode
            );
            discount = discountGroup.Discount;
            break;
          case DiscountsType.BPXItem:
            discountGroup = this.FilterDiscountsDynamic(
                'CardCode',
                this.data.CustomerCode,
                'ItemCode',
                _documentLine.ItemCode
            );
            discount = discountGroup.Discount;
            break;
          case DiscountsType.BPXItemGroup:
            discountGroup = this.FilterDiscountsDynamic(
                "CardCode",
                this.data.CustomerCode,
                "ItemGroup",
                _documentLine.GroupCode
            );
            discount = discountGroup.Discount;
            break;
          case DiscountsType.ItemGroup:
            discountGroup = this.FilterDiscountsDynamic(
                "ItemGroup",
                _documentLine.GroupCode,
                "ItemGroup",
                _documentLine.GroupCode
            );
            discount = discountGroup.Discount;
            break;
          case DiscountsType.BPXItemFamily:
            discountGroup = this.FilterDiscountsDynamic(
                'AuxField',
                _documentLine.Family,
                'CardCode',
                this.data.CustomerCode
            );
            discount = discountGroup.Discount;
            break;
          case DiscountsType.BlanketAgreements:
            if (productHasBlanketAgreement) {
              this.blanketAgreement.forEach(x => {
                const blanketAgreementDtl = x.Lines.find(l => l.ItemCode === _documentLine.ItemCode);

                if (blanketAgreementDtl)
                {
                  _documentLine.UnitPrice = CLMathRound(this.data.DecimalCompany?.Price, this.data.IsLocalCurrency && this.data.Currency == blanketAgreementDtl.Currency ? blanketAgreementDtl.UnitPrice : (blanketAgreementDtl.UnitPrice * this.data.ExchangeRate));

                  _documentLine.UnitPriceFC =  CLMathRound(this.data.DecimalCompany?.Price, this.data.IsLocalCurrency && this.data.Currency == blanketAgreementDtl.Currency ? (blanketAgreementDtl.UnitPrice / this.data.ExchangeRate) : blanketAgreementDtl.UnitPrice);

                  blanketAgreementApplied = true;
                }
              });

              excludeProductFromBlanketAgreement = false;
            }
            break;
        }

        if (discount)
        {
          discountFound = true;

          _documentLine.DiscountPercent = discount;
        }
      }

      if (excludeProductFromBlanketAgreement && productHasBlanketAgreement)
      {
        this.blanketAgreement.forEach(ba => {
          let productIndex: number = ba.Lines.findIndex(pl => pl.ItemCode === _documentLine.ItemCode);

          if (productIndex != -1)
          {
            ba.Lines[productIndex].HasDiscountApplied = true;
          }
        });
      }
    }

    if (!_documentLine.Discount) _documentLine.DiscountPercent = 0;

    _documentLine.DiscountPercent += +this.data.HeaderDiscount;

    _documentLine.PriceDiscount = CLMathRound(this.data.DecimalCompany?.Price, this.data.IsLocalCurrency ? _documentLine.UnitPrice - (_documentLine.UnitPrice * (_documentLine.DiscountPercent / 100)) : _documentLine.UnitPriceFC - (_documentLine.UnitPriceFC * (_documentLine.DiscountPercent / 100)));

    _documentLine.TotalDesc = CLMathRound(this.data.DecimalCompany?.Price, this.data.IsLocalCurrency ? (_documentLine.UnitPrice * (_documentLine.DiscountPercent / 100)) : (_documentLine.UnitPriceFC * (_documentLine.DiscountPercent / 100)));

    _documentLine.Total = CLMathRound(this.data.DecimalCompany?.TotalLine, _documentLine.PriceDiscount * (1 + ((_documentLine.TaxRate ?? 0) / 100)));

    _documentLine.TotalImp = CLMathRound(this.data.DecimalCompany?.Price, _documentLine.PriceDiscount * ((_documentLine.TaxRate ?? 0) / 100));
  }
  
  /**
   * This method is use to calculate totalamount
   * @constructor
   */
  private CalculateTotalAmount(): void {

    this.itemSelected.forEach(element => {
      element.UnitPriceCOL = CLMathRound(this.data?.DecimalCompany?.Price, element.UnitPrice);

      let unitPrice = this.data.IsLocalCurrency ?  element.UnitPrice : element.UnitPriceFC;

      element.UnitPrice = CLMathRound(this.data?.DecimalCompany?.Price, unitPrice);

      let price = CLMathRound(this.data?.DecimalCompany?.Price, element.UnitPrice * element.Quantity);
      let priceDiscount = CLMathRound(this.data?.DecimalCompany?.Price, price - (price * (element.DiscountPercent / 100)));

      let totalDiscount = CLMathRound(this.data?.DecimalCompany?.Price, price - priceDiscount);
      let totalTax = CLMathRound(this.data?.DecimalCompany?.Price, priceDiscount * (element.TaxRate / 100));

      let total = CLMathRound(this.data?.DecimalCompany?.TotalLine, priceDiscount + totalTax);

      element.PriceDiscount = priceDiscount;
      element.TotalDesc = totalDiscount;
      element.TotalImp = totalTax;
      element.Total = total;
      element.TotalCOL = this.CalculateTotalByCurrency(element);
      element.TotalFC = this.CalculateTotalByCurrency(element, true);
    });
  }

  /**
   * calculate the total in local currency
   * @param line
   * @param isFC
   * @constructor
   */
  CalculateTotalByCurrency (line: IDocumentLine, isFC: boolean = false): number {
    let unitPrice = isFC? line.UnitPriceFC: line.UnitPriceCOL;
    let price = CLMathRound(this.data?.DecimalCompany?.Price, unitPrice * line.Quantity);
    let priceDiscount = CLMathRound(this.data?.DecimalCompany?.Price, price - (price * (line.DiscountPercent / 100)));
    let totalTax = CLMathRound(this.data?.DecimalCompany?.Price, priceDiscount * (line.TaxRate / 100));

    return CLMathRound(this.data?.DecimalCompany?.TotalLine, priceDiscount + totalTax);
  }


  /**
   * This method set location
   * @param _item models items
   * @returns
   */
  private SetBinAlocation(_item: IItem): IDocumentLinesBinAllocations[] {
    if (_item.AbsEntry) {
      return [
        {
          BinAbsEntry: _item.AbsEntry,
          Quantity: 1,
          SerialAndBatchNumbersBaseLine: 0
        } as IDocumentLinesBinAllocations
      ]
    } else {
      return [];
    }
  }

  /**
   * This method set serial
   * @param _item models items
   * @returns
   */
  private SetSeries(_item: IItem): ISerialNumbers[] {
    if (_item.ManSerNum === BatchSerial[BatchSerial.Y]) {
      return [{
        SystemSerialNumber: +_item.SysNumber,
        Quantity: 1,
        DistNumber: _item.DistNumberSerie
      } as ISerialNumbers
      ]
    } else {
      return [];
    }
  }

  ProcessItemScanner(_item: IItem | null) {
    if (_item) {
      let itemsDetails: IItem = _item;

      //#region Stock validations
      if (![this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type)) {
        let validateOnHand = this.validatInventory.find(element => element.Table === this.table)?.ValidateInventory ?? false;

        if (!itemsDetails.OnHand && validateOnHand) {

          this.commonService.Alert(AlertType.INFO, 'El item no posee stock', 'The item is out of stock');

          return;
        }
      }
      //#endregion

      //#region Tax validations
      let tax: ISalesTaxes = this.data.TaxList.find(tax => tax.TaxCode === itemsDetails.TaxCode);

      if (!tax) {
        let message = this.commonService.Translate(
            `El artículo seleccionado no tiene el impuesto definido. Por favor, contacte a su administrador o actualice el impuesto si tiene permiso.`,
            `The selected item does not have the tax defined. Please contact your administrator or update the tax if you have permission.`
        );

        this.commonService.alert(AlertType.WARNING, message);

        this.logManagerService.Log(LogEvent.WARNING, message);
      }
      //#endregion

      //#region Mappings
      itemsDetails.Quantity = 1;

      let itemDetailsMeasurementUnit: IUoMmasterData;

      if (itemsDetails.UoMMasterData && itemsDetails.UoMMasterData.length) {
        itemDetailsMeasurementUnit = itemsDetails.UoMMasterData[0];
      }

      let documentLine = {
        ...itemsDetails,
        TaxOnly: 'tNO',
        TaxCode: _item?.TaxCode ?? '',
        TaxRate: tax?.TaxRate ?? 0,
        WarehouseCode: itemsDetails.WhsCode ?? this.data.UserWarehouse,
        UnitPrice: itemDetailsMeasurementUnit?.UnitPrice ?? 0,
        UnitPriceFC: itemDetailsMeasurementUnit?.UnitPriceFC ?? 0,
        UoMEntry: itemDetailsMeasurementUnit?.UoMEntry,
        DocumentLinesBinAllocations: this.SetBinAlocation(itemsDetails),
        SerialNumbers: this.SetSeries(itemsDetails),
        BatchNumbers: [],
        LinesCurrenciesList: [],
        Currency: this.data.Currency,
        IsBillOfMaterialsOpen: false
      } as IDocumentLine;

      this.ApplyDiscountOrBlanketAgreement(documentLine);

      this.itemSelected.push(documentLine);

      this.CalculateTotalAmount();

    }else
    {
      let message = this.commonService.Translate(
          `Item no encontrado`,
          `Item not found`
      );

      this.commonService.alert(AlertType.ERROR, message);

      this.logManagerService.Log(LogEvent.ERROR, message);
    }

    const result: ISelectedProducts = {
      Items: this.itemSelected,
      BatchedItems: [],
      BlanketAgreementName: this.blanketAgreementNames
    } as ISelectedProducts;

    this.scannedItem.emit(result);
    this.itemSelected = [];
  }

  /**
   * Opens the QR scanner to scan an item and retrieves its details.
   * It requests camera permissions, handles scanning, and processes the scanned item.
   */
 async OpenScanner(): Promise<void> {
    let loader: HTMLIonLoadingElement;
    let itemExist : boolean = false;
    // Request permissions and show the camera to scan
    this.qrScannerService.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {
        this.qrScannerService.show();
        this.scanStatus.emit(true)
        const scanSub: Subscription = this.qrScannerService.scan()
            .pipe(
                switchMap(async (scannedCode) =>{
                  loader = await this.commonService.Loader();
                  loader.present();

                  return scannedCode
                }),
                concatMap(  (scannedCode)  => {
                  itemExist = this.ItemExistInDocumentLines(scannedCode);
                  if(itemExist)
                  {
                    loader.dismiss();
                    return of('')
                  }

                  return of(scannedCode);
                }),
                concatMap((code) =>{
                  if(code && code != ' '){
                    return this.productService.GetItemDetail(code, this.data.UserWarehouse, this.data.DocumentTable, this.data.DocType, 0, this.data.PriceListNum, ViewType.SellItem);
                  }
                  return of(null)
                }),
                finalize(()=>{
                  
                  this.scanStatus.emit(false)
                  this.qrScannerService.hide();
                  this.qrScannerService.destroy();
                  loader.dismiss();
                })
            )
            .subscribe({
                next: (callback) => {
                    try
                    {
                      if(!itemExist) {
                        this.ProcessItemScanner(callback?.Data || null);
                      }
                      scanSub.unsubscribe();
                    }
                    catch (error)
                    {
                      this.logManagerService.Log(LogEvent.ERROR, `${error.message || error}`);
          
                      this.commonService.alert(AlertType.ERROR, `Error: ${error}`);

                      scanSub.unsubscribe();
                      
                    }
                  },
                    error: (error) => {
            
                      this.logManagerService.Log(LogEvent.ERROR, error);
            
                      this.commonService.alert(AlertType.ERROR, `Error: ${error}`);

                      scanSub.unsubscribe();
                   }
            });

      } else if (status.denied) {
        this.AssignCameraPermissions()
      } 
    }).catch((err: Error) =>{
      if(err?.name == "CAMERA_ACCESS_DENIED"){
        this.AssignCameraPermissions()
      }else{
        this.commonService.alert(AlertType.ERROR, err.message);
      }
    }
    );
  }

  /**
   * Displays a confirmation dialog to request camera access permissions.
   * 
   * @constructor
   */
  AssignCameraPermissions(){
    this.commonService.Alert(
        AlertType.QUESTION,
        'Esta aplicación necesita acceso a la cámara para el escaneo.\n' +
        '\n' +
        '¿Quieres ir a la configuración de tu dispositivo para habilitarlo manualmente?',
        'This app needs camera access for scanning'+
        '\n' +
        'Would you like to go to your device settings to enable it manually?',
        'Permiso de cámara requerido',
        'Camera Permission Required',
        [
          {
            text: this.translateService.currentLang == "es" ? 'Cancelar' : 'Cancel',
            role: "cancel",
          },
          {
            text: this.translateService.currentLang == "es" ? 'Ir a configuración' : 'Go to Settings',
            handler: () => {
              // Redirects to settings
              this.qrScannerService.openSettings();
            },
          },
        ],
    );
  }
}
