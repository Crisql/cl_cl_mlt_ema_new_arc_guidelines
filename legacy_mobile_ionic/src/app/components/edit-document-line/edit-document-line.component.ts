import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { ActionSheetButton, ActionSheetController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AlertType, BinActivatedWarehouse, BoYesNoEnum, PublisherVariables } from '../../common/enum';
import { LogEvent } from 'src/app/common';
import { IMeasurementUnit, PermissionsSelectedModel, } from "src/app/models";
import {
    CommonService,
    LogManagerService,
    PermissionService,
    ProductService,
    PublisherService,
    TaxService
} from "src/app/services";
import { IEditDocumentLineComponentData } from "src/app/models/db/i-modals-data";
import { AllocationService } from "../../services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { filter, finalize, map, switchMap } from "rxjs/operators";
import { FormControl, FormGroup } from "@angular/forms";
import { IProduct } from 'src/app/interfaces/i-product';
import { ITax } from "../../models/i-tax";
import { forkJoin, of } from "rxjs";
import { IBinLocation } from "../../interfaces/i-BinLocation";
import { ItemsService } from "../../services/items.service";
import { IStockAvailable } from "../../interfaces/i-stock-available";
import { IWarehouses } from "src/app/interfaces/i-warehouse";
import { IDocumentLine, IUoMmasterData } from "../../interfaces/i-item";
import { ISalesTaxes } from "../../interfaces/i-sales-taxes";
import { CLMathRound } from "src/app/common/function";

@Component({
    selector: "app-edit-document-line",
    templateUrl: "./edit-document-line.component.html",
    styleUrls: ["./edit-document-line.component.scss"],
})
export class EditDocumentLineComponent implements OnInit, OnDestroy {
    // varbox
    itemLocationStock: number;
    selectedWarehouseInfo: IStockAvailable;
    productForm: FormGroup;
    allocations: IBinLocation[];
    selectedBinCode: string;
    permisionList: PermissionsSelectedModel[];
    currentLang: string;
    @Input('data') data: IEditDocumentLineComponentData;
    taxes: ISalesTaxes[] = [];
    showProductInventory: boolean;
    product: IDocumentLine;
    selectedWarehouse!: IWarehouses;

    constructor(
        private modalController: CustomModalController,
        public network: Network,
        private translateService: TranslateService,
        private commonService: CommonService,
        private permissionService: PermissionService,
        private logManagerService: LogManagerService,
        private actionSheetController: ActionSheetController,
        private allocationService: AllocationService,
        private publisherService: PublisherService,
        private itemsService: ItemsService,
        private alertService: CommonService
    ) {
    }

    ngOnDestroy(): void {
        this.modalController.DismissAll();
    }

    ngOnInit() {
        this.taxes = this.data.taxes;
        this.allocations = [];
        this.permisionList = [...this.permissionService.Permissions];
        this.publisherService.getObservable()
            .pipe(
                filter(p => p.Target === PublisherVariables.Permissions)
            )
            .subscribe({
                next: (callback) => {
                    if (callback) {
                        this.permisionList = [...this.permissionService.Permissions];
                    }
                }
            });
        this.showProductInventory = false;
        this.product = this.data.item;
        this.selectedWarehouse = this.data.wareHouseList.find((wh) => wh.WhsCode === this.product.WarehouseCode);
        this.selectedBinCode = this.product.BinCode;
        this.LoadForm();
        this.productForm.patchValue({ ...this.product });
        this.currentLang = this.translateService.currentLang;
        this.LoadInitialData();
    }

    LoadForm(): void {
        this.productForm = new FormGroup({
            ItemCode: new FormControl(''),
            ItemName: new FormControl(''),
            Quantity: new FormControl(0),
            UnitPrice: new FormControl(0),
            UoMEntry: new FormControl(0),
            DiscountPercent: new FormControl(0),
            PriceDiscount: new FormControl(0),
            Total: new FormControl(0),
            TaxOnly: new FormControl('tNO'),
            TaxCode: new FormControl(''),
            TaxRate: new FormControl(0),
            TotalDesc: new FormControl(0),
            TotalImp: new FormControl(0),
            WharehouseCode: new FormControl(''),
            BinAbs: new FormControl(0),
            BinCode: new FormControl('')
        });
    }

    /**
     * This method is used load initial data
     * @constructor
     * @private
     */
    async LoadInitialData(): Promise<void> {

        if([this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type))
        {
            return 
        }
        
        const loading = await this.commonService.loading('');
        loading.present();

        this.itemsService.GetStocAvailableForWarehouse(this.product.WarehouseCode, this.product.ItemCode).pipe(
            switchMap(callback => {
                if (this.selectedWarehouse.BinActivat === BinActivatedWarehouse.Yes) {
                    return this.allocationService.GetAllocations(this.product?.ItemCode, this.product?.WharehouseCode).pipe(
                        map(response => {
                            return {
                                BinLocations: response.Data,
                                Stock: callback.Data
                            }
                        })
                    )
                } else {
                    return of({
                        BinLocations: [] as IBinLocation[],
                        Stock: callback.Data
                    })
                }
            }),
            finalize(() => loading.dismiss())
        ).subscribe({
            next: (callback) => {
                if (callback.BinLocations && callback.BinLocations.length > 0) {
                    this.itemLocationStock = callback.BinLocations.find(element => element.AbsEntry === this.product?.BinAbs)?.Stock ?? 0;
                }
                this.selectedWarehouseInfo = callback.Stock;
                this.allocations = callback.BinLocations ?? [];
            },
            error: (error) => {
                this.alertService.alert(AlertType.ERROR, error);
                this.logManagerService.Log(LogEvent.ERROR, error);
            }
        })
    }

    /**
     * This method is used to select tax code
     * @param _code tax code
     * @constructor
     */
    ChangeTax(_code: string): void {
        let tax: ISalesTaxes = this.taxes.find((tax) => tax.TaxCode === _code);

        if (tax) {
            this.productForm.get('TaxCode').patchValue(tax.TaxCode);
            this.productForm.get('TaxRate').patchValue(tax.TaxRate);
        }

        this.ChangeData();
    }

    /**
     * This method is used to change data of the form to update models
     * @constructor
     */
    ChangeData(): void {

        let NewProduct = this.productForm.value;
        
        //It is validated that it has a valid value to perform the assignment
        if(!NewProduct?.Quantity || !NewProduct?.UnitPrice || NewProduct?.DiscountPercent == null || NewProduct?.DiscountPercent < 0){
            return
        }
        
        this.product.Quantity = NewProduct?.Quantity ?? 0
        this.product.UnitPrice = NewProduct?.UnitPrice ?? 0;
        this.product.UnitPriceCOL = this.data.isLocal ?  NewProduct?.UnitPrice :  CLMathRound(this.data.decimalCompany.Price, NewProduct?.UnitPrice  * this.data.exchangeRate);
        this.product.UnitPriceFC = !this.data.isLocal ?  NewProduct?.UnitPrice :  CLMathRound(this.data.decimalCompany.Price, NewProduct?.UnitPrice  / this.data.exchangeRate);
        this.product.DiscountPercent = NewProduct?.DiscountPercent ?? 0;
        this.product.TaxOnly = NewProduct?.TaxOnly;
        this.product.TaxCode = NewProduct.TaxCode;
        
        this.product.DocumentLinesBinAllocations?.forEach(location=>{
            location.Quantity = this.product.Quantity;
        })

        if (!this.product.Quantity) {
            this.productForm.get('Quantity').patchValue(this.product.Quantity);

        }

        if (!this.product.UnitPrice) {
            this.productForm.get('UnitPrice').patchValue(this.product.UnitPrice);

        }

        if (!this.product.DiscountPercent || this.product.DiscountPercent > 99) {
            this.productForm.get('DiscountPercent').patchValue(this.product.DiscountPercent);
        }

        this.product.PriceDiscount = CLMathRound(this.data.decimalCompany.Price, this.product.UnitPrice - (this.product.UnitPrice * (this.product.DiscountPercent / 100)));
        this.product.TotalDesc = CLMathRound(this.data.decimalCompany.Price, (this.product.UnitPrice - this.product.PriceDiscount) * this.product.Quantity);
        this.product.TaxRate = this.taxes?.find(x => this.product.TaxCode === x.TaxCode)?.TaxRate || 0;
        this.product.TotalImp = CLMathRound(this.data.decimalCompany.Price, (this.product.VATLiable == false ? 0:(this.product.PriceDiscount * this.product.Quantity) * (this.product.TaxRate / 100)));
        this.product.Total = CLMathRound(this.data.decimalCompany.TotalLine, this.product.TotalImp + (this.product.PriceDiscount * this.product.Quantity));
        this.product.TotalCOL = this.CalculateTotalByCurrency();
        this.product.TotalFC = this.CalculateTotalByCurrency(true);
        //Se hacer por separado par no realizar un bucle por la deteccion de cambios
        this.productForm.get('TotalDesc').patchValue(this.product.TotalDesc);
        this.productForm.get('PriceDiscount').patchValue(this.product.PriceDiscount);
        this.productForm.get('TaxRate').patchValue(this.product.TaxRate);
        this.productForm.get('TotalImp').patchValue(this.product.TotalImp);
        this.productForm.get('Total').patchValue(this.product.Total);
    }

    /**
     * calculate the total in local currency
     * @param isFC
     * @constructor
     */
    CalculateTotalByCurrency (isFC: boolean = false): number {
        let unitPrice = isFC? this.product.UnitPriceFC: this.product.UnitPriceCOL;
        
        let priceDiscount = CLMathRound(this.data.decimalCompany.Price, unitPrice - (unitPrice * (this.product.DiscountPercent / 100)));
        let totalImp = CLMathRound(this.data.decimalCompany.Price, (this.product.VATLiable == false ? 0:(priceDiscount * this.product.Quantity) * (this.product.TaxRate / 100)));
        return CLMathRound(this.data.decimalCompany.TotalLine, totalImp + (priceDiscount * this.product.Quantity));
    }

    /**
     * This method is used to select unit
     * @param _uomEntry model unit
     * @constructor
     */
    async OnChangeProductUoM(_uomEntry: number): Promise<void> {
        let data: IUoMmasterData = this.product.UoMMasterData.find(element => element.UoMEntry === _uomEntry);
        if (data) {
            this.product.UoMEntry = data.UoMEntry || -1;
            this.product.UnitPrice = data.UnitPrice;
            this.product.UnitPriceFC = data.UnitPriceFC;
            if (this.data.isLocal) {
                this.product.UnitPrice = data.UnitPrice;
            } else {
                this.product.UnitPrice = data.UnitPriceFC;
            }
            this.productForm.get('UnitPrice').patchValue(this.product.UnitPrice);
            this.ChangeData();
        }
    }

    /**
     * This method is used to delete discount
     * @constructor
     */
    DeleteDiscount() {
        if (!this.product.DiscountPercent || this.product.DiscountPercent < 1) {
            this.productForm.get('DiscountPercent').patchValue(0);
        }
    }

    VerifyDiscountValue() {
        if (!this.product.DiscountPercent) {
            this.productForm.get('DiscountPercent').patchValue(0);
        }
    }

    /**
     * This method validate inputs fields
     * @constructor
     */
    async ValidateFields() {

        let NewProduct = this.productForm.value;
        
        if (NewProduct?.Quantity == null || NewProduct?.Quantity <= 0) {
            let message = this.commonService.Translate('Debe definir la cantidad del producto', "Must define product's amount and price");

            this.commonService.alert(AlertType.WARNING, message);
            this.logManagerService.Log(LogEvent.WARNING, message);
            return
        }

        if (NewProduct?.UnitPrice == null || NewProduct?.UnitPrice <= 0) {
            let message = this.commonService.Translate('Debe definir el precio del producto', "Must define product's amount and price");

            this.commonService.alert(AlertType.WARNING, message);
            this.logManagerService.Log(LogEvent.WARNING, message);
            return
        }

        if (NewProduct?.DiscountPercent == null || NewProduct?.DiscountPercent < 0) {
            let message = this.commonService.Translate('Debe definir el descuento del producto', "Must define the product discount");

            this.commonService.alert(AlertType.WARNING, message);
            this.logManagerService.Log(LogEvent.WARNING, message);
            return
        }

        if (!this.product.TaxCode) {
            let message = this.commonService.Translate('Debe seleccionar el tipo de impuesto', 'Must select the type of tax');

            this.commonService.alert(AlertType.WARNING, message);
            this.logManagerService.Log(LogEvent.WARNING, message);
            return
        }

        this.Dismiss(this.product);

    }

    /**
     * This method is used to close modal
     * @param product represent the dat model product
     * @constructor
     */
    Dismiss(product: IDocumentLine = null) {
        this.modalController.dismiss(product);
    }

    VerifyPermission(permision: string): boolean {
        return !this.permisionList.some(perm => perm.Name === permision);
    }

    /**
     * This method is used to select warehouse
     * @constructor
     */
    async ShowAvailableWarehouses(): Promise<void> {

        const BUTTONS: ActionSheetButton[] = [];

        this.data.wareHouseList.forEach(wh => {
            let cssClass: string = wh.WhsCode === this.productForm.get('WharehouseCode').value ? "wh-selected" : "";

            let availableWarehouse: ActionSheetButton = {
                text: wh.WhsName,
                icon: "storefront-outline",
                role: wh.WhsCode,
                handler: () => {

                },
                cssClass
            };

            BUTTONS.push(availableWarehouse);
        });


        BUTTONS.push({
            text: this.commonService.Translate(
                `Cancelar`,
                `Cancel`
            ),
            icon: 'close-outline',
            role: "",
            handler: () => {
            }
        })

        const actionSheet = await this.actionSheetController.create({
            buttons: BUTTONS,
            header: this.commonService.Translate("Almacenes", "Warehouses")
        });

        await actionSheet.present();

        let result = await actionSheet.onDidDismiss();

        if (result.role && result.role !== 'backdrop') {
            this.selectedWarehouse = this.data.wareHouseList.find(wh => wh.WhsCode === result.role);
            this.productForm.get('WharehouseCode').patchValue(result.role);
            this.product.WarehouseCode = result.role;
            // Al seleccionar un almacen se resetean las ubicaciones
            this.selectedBinCode = '';
            this.productForm.get('BinAbs').patchValue(null);
            this.productForm.get('BinCode').patchValue(null);
            this.itemLocationStock = 0;

            if([this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type))
            {
                return
            }

            const loading = await this.commonService.loading('');
            loading.present();
            this.itemsService.GetStocAvailableForWarehouse(this.selectedWarehouse.WhsCode, this.product.ItemCode).pipe(
                switchMap(callback => {
                    if (this.selectedWarehouse.BinActivat === BinActivatedWarehouse.Yes) {
                        return this.allocationService.GetAllocations(this.product.ItemCode, this.selectedWarehouse.WhsCode).pipe(
                            map(response => {
                                return {
                                    BinLocation: response.Data,
                                    Stock: callback.Data
                                }
                            })
                        )
                    } else {
                        return of({
                            BinLocation: null,
                            Stock: callback.Data
                        })
                    }
                }),
                finalize(() => loading.dismiss())
            ).subscribe({
                next: (callback) => {
                    this.allocations = callback.BinLocation ?? [];
                    this.selectedWarehouseInfo = callback.Stock;
                },
                error: (error) => {
                    this.alertService.alert(AlertType.ERROR, error);
                }
            })
        }
    }

    /**
     * This methos is used to select bin location
     * @constructor
     */
    async ShowAvailableLocations(): Promise<void> {

        const BUTTONS: ActionSheetButton[] = [];

        this.allocations.forEach(bin => {
            let cssClass: string = bin.BinCode === this.productForm.get('BinCode').value ? "bin-selected" : "";

            let availableBin: ActionSheetButton = {
                text: bin.BinCode,
                icon: "pricetags",
                role: bin.AbsEntry.toString(),
                handler: () => {

                },
                cssClass
            };

            BUTTONS.push(availableBin);
        });


        BUTTONS.push({
            text: this.commonService.Translate(
                `Cancelar`,
                `Cancel`
            ),
            icon: 'close-outline',
            role: "",
            handler: () => {
            }
        })

        const actionSheet = await this.actionSheetController.create({
            buttons: BUTTONS,
            header: this.commonService.Translate("Ubicaciones", "Bin Allocations")
        });

        await actionSheet.present();

        let result = await actionSheet.onDidDismiss();

        if (result.role && result.role !== 'backdrop') {
            let binLocation = this.allocations.find(bin => bin.AbsEntry === +result.role);
            if (binLocation) {
                this.itemLocationStock = binLocation.Stock;
                this.selectedBinCode = binLocation.BinCode;
                this.productForm.get('BinAbs').patchValue(binLocation.AbsEntry);
                this.productForm.get('BinCode').patchValue(binLocation.BinCode);
            } else {
                this.itemLocationStock = 0;
            }
        }
    }


}
