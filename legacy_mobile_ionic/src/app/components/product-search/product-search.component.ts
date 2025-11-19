import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { AlertType, DiscountsType } from "src/app/common";
import { BatchSerial, HeadersData, LocalStorageVariables, LogEvent, SettingCodes, ViewType } from '../../common/enum';
import { DiscountGroup, DiscountHierarchy, IBlanketAgreement } from "src/app/models";
import { CommonService, LocalStorageService, LogManagerService, ProductService } from "src/app/services";
import {forkJoin, of, Subject} from "rxjs";
import { debounceTime, finalize } from "rxjs/operators";
import { IProductSearchComponentInputData } from "src/app/models/db/i-modals-data";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { SettingsService } from "../../services/settings.service";
import { ICompany } from "../../models/db/companys";
import { IValidateInventory, IValidateInventorySetting } from "../../interfaces/i-settings";
import {IDocumentLine, IUoMmasterData} from "../../interfaces/i-item";
import { IDocumentLinesBinAllocations, ISerialNumbers } from 'src/app/interfaces/i-batches';
import { CLMathRound } from "src/app/common/function";
import {IItem} from "../../models/i-item";
import {ISalesTaxes} from "../../interfaces/i-sales-taxes";
import {Network} from "@ionic-native/network/ngx";
import { IUserAssign } from "src/app/models/db/user-model";

@Component({
    selector: "app-product-search",
    templateUrl: "./product-search.component.html",
    styleUrls: ["./product-search.component.scss"],
})
export class ProductSearchComponent implements OnInit, OnDestroy {
    // varbox
    
    @Input('data') data: IProductSearchComponentInputData;

    searchTerm: string;
    table: string = '';
    currency: string;

    page: number = 0;
    recordsCount: number = 0;
    pageSize: number = 40;


    expanded = false;
    isLoading: boolean = false;
    hasMore: boolean = true;

    products: IItem[] = [];
    filteredProducts: IItem[] = [];
    blanketAgreement: IBlanketAgreement[] = [];
    validatInventory: IValidateInventory[] = [];
    productSelected: IDocumentLine[] = [];
    blanketAgreementNames: string[] = [];

    userAssignment: IUserAssign;

    searchSubject = new Subject<{searchTerm: string; element: any;}>();

    constructor(
        private modalController: CustomModalController,
        private productService: ProductService,
        private commonService: CommonService,
        private logManagerService: LogManagerService,
        private settingsService: SettingsService,
        private localStorageService: LocalStorageService,
        private network: Network
    ) {
    }

    ngOnDestroy(): void {
        this.modalController.DismissAll();
    }

    ngOnInit() {
        this.userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment);
        this.LoadProducts();

        this.searchSubject.pipe(
            debounceTime(500) 
        ).subscribe(({searchTerm, element}) => {
            this.FilterItems(searchTerm).then(()=>element.setFocus());
        });

        this.FilterItems(this.searchTerm);
    }

    /**
     * This method is used to load products
     * @constructor
     */
    async LoadProducts(): Promise<void> {
        this.blanketAgreement = this.data.BlanketAgreements;
        
        this.table = this.data.DocumentTable;

        if (!this.blanketAgreement) this.blanketAgreement = [];

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
                    let settings: IValidateInventorySetting[] = JSON.parse(responses.Setting.Data?.Json || '[]');
                    
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
     * This method is used to save items selected
     * @constructor
     */
    async SaveItemsSelected(): Promise<void> {
        if (!this.productSelected || this.productSelected.length === 0) {
            this.commonService.toast(this.commonService.Translate(`Seleccione un producto al menos, por favor`, `Choose an item at least please`), 'dark', 'bottom');
            return;
        }

        if (this.productSelected.some(p => !p.Quantity)) {
            await this.commonService.toast(this.commonService.Translate('Hay al menos un producto con cantidad menor o igual a cero', 'There is at least one product with quantity less than or equal to zero'), 'dark', 'bottom');
            return;
        }

        this.CalculateTotalAmount();

        await this.Dismiss({
            'Items': this.productSelected,
            'BlanketAgreementName': this.blanketAgreementNames,
            'BatchedItems': []
        });
    }

    /**
     * This method retrieves more details of the selected item
     * @param _item The selected item
     * @param _index The index of the product in the collection
     * @constructor
     */
    async SelectItem(_item: IItem): Promise<void> 
    {
        _item.State = !_item.State;

        if (_item.State) 
        {
            let loader = await this.commonService.Loader();

            loader.present();

            this.productService.GetItemDetail(_item.ItemCode, this.data.UserWarehouse, this.data.DocumentTable, this.data.DocType, _item.SysNumber,this.data.PriceListNum, 'SellItem' )
                .pipe(
                    finalize(() => loader.dismiss())
                ).subscribe({
                    next: (callback) => {
                        try 
                        {
                            if (callback.Data) 
                            {
                                let itemsDetails: IItem = callback.Data;
                                
                                //#region Stock validations
                                if(![this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type))
                                {
                                    let validateOnHand = this.validatInventory.find(element => element.Table === this.table)?.ValidateInventory ?? false;

                                    if (!itemsDetails.OnHand && validateOnHand)
                                    {
                                        _item.State = !_item.State;

                                        this.commonService.Alert(AlertType.INFO, 'El item no posee stock', 'The item is out of stock');

                                        return;
                                    }
                                }
                                //#endregion
    
                                //#region Tax validations
                                let tax: ISalesTaxes = this.data.TaxList.find(tax => tax.TaxCode === itemsDetails.TaxCode);
                                
                                if (!tax) 
                                {
                                    let message = this.commonService.Translate(
                                        `El artículo seleccionado no tiene el impuesto definido. Por favor, contacte a su administrador o actualice el impuesto si tiene permiso.`,
                                        `The selected item does not have the tax defined. Please contact your administrator or update the tax if you have permission.`
                                    );
                                    
                                    this.commonService.alert(AlertType.WARNING, message);
                                    
                                    this.logManagerService.Log(LogEvent.WARNING, message);
                                }
                                //#endregion
    
                                //#region Mappings
                                _item.Quantity = 1;

                                let itemDetailsMeasurementUnit: IUoMmasterData;

                                if(itemsDetails.UoMMasterData && itemsDetails.UoMMasterData.length)
                                {
                                    itemDetailsMeasurementUnit = itemsDetails.UoMMasterData[0];
                                }

                                let documentLine = {
                                    ..._item,
                                    ...itemsDetails,
                                    TaxOnly: 'tNO',
                                    TaxCode: callback?.Data?.TaxCode ?? '',
                                    TaxRate: tax?.TaxRate ?? 0,
                                    WarehouseCode: itemsDetails.WhsCode ?? this.data.UserWarehouse,
                                    UnitPrice: itemDetailsMeasurementUnit?.UnitPrice ?? 0,
                                    UnitPriceFC: itemDetailsMeasurementUnit?.UnitPriceFC ?? 0,
                                    UoMEntry: itemDetailsMeasurementUnit?.UoMEntry,
                                    DocumentLinesBinAllocations: this.SetBinAlocation(_item),
                                    SerialNumbers: this.SetSeries(_item),
                                    BatchNumbers: [],
                                    LinesCurrenciesList: [],
                                    Currency: this.data.Currency,
                                    IsBillOfMaterialsOpen: false,
                                    VATLiable: itemsDetails.VATLiable,
                                    DiscountPercent: itemsDetails.DiscountPercent?? 0,
                                    LineStatus : 'O'
                                } as IDocumentLine;

                                this.ApplyDiscountOrBlanketAgreement(documentLine);

                                this.productSelected.push(documentLine);
                                //#endregion
                            } 
                            else 
                            {
                                let message = this.commonService.Translate(
                                    `Item ${_item.ItemCode} - ${_item.ItemName} no encontrado`,
                                    `Item ${_item.ItemCode} - ${_item.ItemName} not found`
                                );
                                
                                this.commonService.alert(AlertType.ERROR, message);
                                
                                this.logManagerService.Log(LogEvent.ERROR, message);
                            }
                        } 
                        catch (error) 
                        {
                            this.logManagerService.Log(LogEvent.ERROR, `${error.message || error}`);
                        
                            this.commonService.alert(AlertType.ERROR, `Error: ${error}`);
                        }
                    },
                    error: (error) => {
                        _item.Quantity = 0;
                        
                        _item.State = false;
                        
                        this.logManagerService.Log(LogEvent.ERROR, error);
                        
                        this.commonService.alert(AlertType.ERROR, `Error: ${error}`);
                    }
                });
        } 
        else 
        {
            _item.Quantity = 0;

            let i = this.productSelected.findIndex(itemSelected => itemSelected.ItemCode === _item.ItemCode);
            this.productSelected.splice(i, 1);
        }
    }

    /**
     * This method set quantity
     * @param _qty parameter value
     * @param _item The selected item
     * @constructor
     */
    public OnQuantityChange(_qty: number, _item: IItem): void {
        let i = this.productSelected?.findIndex(itemSelected => itemSelected.ItemCode === _item.ItemCode);
        if (_qty && this.productSelected[i]) {
            this.productSelected[i].Quantity = +_qty;
            if (this.productSelected[i].DocumentLinesBinAllocations && this.productSelected[i].DocumentLinesBinAllocations.length > 0) {
                this.productSelected[i].DocumentLinesBinAllocations.forEach(element => element.Quantity = +_qty)
            }
        }
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

    /**
     * This method is use to calculate totalamount
     * @constructor
     */
    private CalculateTotalAmount(): void {

        this.productSelected.forEach(element => {
            element.UnitPriceCOL = CLMathRound(this.data?.DecimalCompany?.Price, element.UnitPrice);
            
            let unitPrice = this.data.IsLocalCurrency ?  element.UnitPrice : element.UnitPriceFC;
            
            element.UnitPrice = CLMathRound(this.data?.DecimalCompany?.Price, unitPrice);
            
            let price = CLMathRound(this.data?.DecimalCompany?.Price, element.UnitPrice * element.Quantity);
            let priceDiscount = CLMathRound(this.data?.DecimalCompany?.Price, price - (price * (element.DiscountPercent / 100)));

            let totalDiscount = CLMathRound(this.data?.DecimalCompany?.Price, price - priceDiscount);
            let totalTax = CLMathRound(this.data?.DecimalCompany?.Price, (element.VATLiable == false ? 0: priceDiscount * (element.TaxRate / 100)));

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
        let totalTax = CLMathRound(this.data?.DecimalCompany?.Price, (line.VATLiable == false ? 0:priceDiscount * (line.TaxRate / 100)));

        return CLMathRound(this.data?.DecimalCompany?.TotalLine, priceDiscount + totalTax);
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

        if (!_documentLine.Discount)
        _documentLine.DiscountPercent += +this.data.HeaderDiscount;
        
        _documentLine.PriceDiscount = CLMathRound(this.data.DecimalCompany?.Price, this.data.IsLocalCurrency ? _documentLine.UnitPrice - (_documentLine.UnitPrice * (_documentLine.DiscountPercent / 100)) : _documentLine.UnitPriceFC - (_documentLine.UnitPriceFC * (_documentLine.DiscountPercent / 100)));
        
        _documentLine.TotalDesc = CLMathRound(this.data.DecimalCompany?.Price, this.data.IsLocalCurrency ? (_documentLine.UnitPrice * (_documentLine.DiscountPercent / 100)) : (_documentLine.UnitPriceFC * (_documentLine.DiscountPercent / 100)));
        
        _documentLine.Total = CLMathRound(this.data.DecimalCompany?.TotalLine, _documentLine.PriceDiscount * (1 + ((_documentLine.TaxRate ?? 0) / 100)));
        
        _documentLine.TotalImp = CLMathRound(this.data.DecimalCompany?.Price, _documentLine.PriceDiscount * ((_documentLine.TaxRate ?? 0) / 100));
    }

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

    async Dismiss(items: any = null): Promise<void> {
        this.modalController.dismiss(items);
    }

    /**
     * This method is used to filter products
     * @constructor
     */
    FilterProducts(): void {
        this.filteredProducts = this.products
            .filter(
                (x) =>
                    x.ItemCode?.toUpperCase()?.search(this.searchTerm?.toUpperCase()) > -1 ||
                    x.ItemName?.toUpperCase()?.search(this.searchTerm?.toUpperCase()) > -1
            )
    }

    /**
   * Filters items based on the search term and resets the pagination.
   *
   * @param _searchTerm - The string used to filter items.
   * 
   */
  async FilterItems(_searchTerm: string): Promise<void> {
    let loader = await this.commonService.Loader();
    try {
      loader.present();
      
      this.page = 0;
      this.isLoading = false;
      this.hasMore = true;

      this.productService.GetAllPagination<IItem[]>(_searchTerm, this.userAssignment.WhsCode, ViewType.SellItem, this.page, this.pageSize)
        .pipe(finalize(() => loader.dismiss())
        ).subscribe({
        next: (callback) => {

            this.products = callback.Data?.map((product, index) => ({ ...product, Id: index })) ?? [];
            this.filteredProducts = this.products;

            this.recordsCount = this.localStorageService.data.get(HeadersData.RecordsCount) ? +this.localStorageService.data.get(HeadersData.RecordsCount) :  this.products?.length;
            this.localStorageService.data.delete(HeadersData.RecordsCount)

            this.SelectLoadedItems();
        },
        error: (err) => {
            this.commonService.alert(AlertType.ERROR, err)
        }
        })

    }catch (error){
      this.commonService.alert(AlertType.ERROR, error);
      loader.dismiss()
    }
  }

  /**
   * Handles user input in the search field.
   *
   * @param event - The input event from the search field.
   *
   */
  OnSearchInput(event: any) {
    this.searchTerm = event.target.value ?? '';
    this.searchSubject.next({
      searchTerm: this.searchTerm,
      element: event.target
    });
  }

  /**
   * Handles infinite scroll behavior when the user reaches near the bottom of the list.
   * 
   * @param _index - The index of the currently visible item in the list.
   */
  async OnScroll(_index: number) : Promise<void>{

    if (!this.products?.length || this.isLoading || !this.hasMore || this.products?.length == this.recordsCount) 
      return;
  
    if (_index < (this.products.length - this.pageSize)) 
     return;

    this.isLoading = true;

    this.page++;

    let loader = await this.commonService.Loader();
    loader.present();

    this.productService.GetAllPagination<IItem[]>(this.searchTerm, this.userAssignment.WhsCode, ViewType.SellItem, this.page, this.pageSize)
    .pipe(
      finalize(() => loader.dismiss())
    ).subscribe(
        {
          next: (callback => {
            this.products = [...this.products, ...callback.Data?.map((product, index) => ({ ...product, Id: index })) || []];

            if (this.products.length == this.recordsCount) {
              this.hasMore = false;
            }

            this.filteredProducts = this.products;

            this.isLoading = false;
            this.SelectLoadedItems();
          }),
          error: (error)=>{
            this.commonService.alert(AlertType.ERROR, error)
          }
        }
    );
  }

  /**
   * Selects the loaded items from the filtered products.
   */
  SelectLoadedItems(): void {
    this.productSelected?.forEach(item => {
      const product = this.filteredProducts.find(filterItem => filterItem.ItemCode === item.ItemCode);
      if (product) {
        product.State = true;
        product.Quantity = item.Quantity;
      }
    });
  }

}