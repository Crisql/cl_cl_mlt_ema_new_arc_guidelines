import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { AlertType, BoObjectTypes, HeadersData, LocalStorageVariables, UdfsCategory } from 'src/app/common/enum';
import { InventoryDetailsComponent, UdfPresentationComponent } from 'src/app/components';
import { ItemBarCodeCollection } from 'src/app/interfaces/i-barcode';
import { IItemMasterData, ItemPrice } from 'src/app/interfaces/i-item';
import { ISalesTaxes } from 'src/app/interfaces/i-sales-taxes';
import { ISerialType } from 'src/app/interfaces/i-serie';
import { IFilterKeyUdf, IUdf, IUdfContext, IUdfDevelopment } from 'src/app/interfaces/i-udfs';
import { PermissionsSelectedModel } from 'src/app/models';
import { IUserAssign } from 'src/app/models/db/user-model';
import { IPriceListItemMD } from 'src/app/models/i-price-list';
import { IPriceListInfo } from 'src/app/models/i-price-list-info';
import { ICLResponse } from 'src/app/models/responses/response';
import { CommonService, LocalStorageService, PermissionService, PriceListService, SeriesService, TaxService } from 'src/app/services';
import { BarcodesService } from 'src/app/services/barcodes.service';
import { CustomModalController } from 'src/app/services/custom-modal-controller.service';
import { ItemMasterDataService } from 'src/app/services/item-master-data.service';
import { ItemPriceService } from 'src/app/services/item-price.service';
import { ItemsService } from 'src/app/services/items.service';
import { UdfsService } from 'src/app/services/udfs.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
})
export class ItemsPage {

  page: number = 0;
  recordsCount: number = 0;
  pageSize: number = 40;

  searchTerm: string = '';
  segmentValue : 'searchItem' | 'createItem' = 'searchItem';

  isLoading: boolean = false;
  hasMore: boolean = true;
  isSerial: boolean = false;
  editionMode: boolean = false;
  isBarcodeToggled: boolean = false;
  showScanner: boolean = false;
  ignoreTaxChange: boolean = false;


  currentItem: IItemMasterData;
  userAssignment: IUserAssign;
  itemForm: FormGroup;
  price: FormControl = new FormControl();
  
  items: IItemMasterData[] = [];
  taxes: ISalesTaxes[] = [];
  priceLists: IPriceListInfo[] = [];
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsValues: IUdf[] = [];
  barcodes: ItemBarCodeCollection[] = [];
  itemPrice: ItemPrice[] = [];
  permisionList: PermissionsSelectedModel[] = [];
  udfs: IUdfContext[] = [];


  searchSubject = new Subject<{searchTerm: string; element: any;}>();
  @ViewChild(UdfPresentationComponent, { static: false }) udfPresentationComponent: UdfPresentationComponent;
  constructor(
    private alertController: AlertController,
    private commonService: CommonService,
    private itemMastarDataService: ItemMasterDataService,
    private localStorageService: LocalStorageService,
    private priceListService: PriceListService,
    private taxesService: TaxService,
    private seriesService: SeriesService,
    private udfsService: UdfsService,
    private itemPriceService: ItemPriceService,
    private fb: FormBuilder,
    private barcodesService: BarcodesService,
    private permissionService: PermissionService,
    private itemService: ItemsService,
    private detectorRef: ChangeDetectorRef,
    private modalController: CustomModalController,
  ) { }


  ionViewWillEnter() {
    this.userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment);
    this.permisionList = [...this.permissionService.Permissions];
    this.segmentValue = 'searchItem';
    
    this.searchSubject.pipe(
      debounceTime(500) 
    ).subscribe(({searchTerm, element}) => {
      this.FilterItems(searchTerm).then(()=>element.setFocus());
    });
    
    this.LoadForm();
    this.FilterItems(this.searchTerm);
    this.LoadInitialData();
    this.ResetData();
  }

  /**
   * Loads initial data required for item setup
   * 
   */
  async LoadInitialData() : Promise<void>{
    let loader = await this.commonService.Loader();
    loader.present();
    forkJoin({
      PriceList: this.priceListService.GetPriceListsInfo().pipe(catchError(error => of(null))),
      Taxes: this.taxesService.GetTaxes().pipe(catchError(error => of(null))),
      Serial: this.seriesService.GetIsSerial(this.userAssignment.Id, BoObjectTypes.Item, this.userAssignment.CompanyId).pipe(catchError((error: HttpErrorResponse) => this.ErrorSerialType(error))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(UdfsCategory.OITM).pipe(catchError(error => of(null))),
      UDFs: this.udfsService.Get(UdfsCategory.OITM).pipe(
                      map(response => response.Data),
                      catchError(error => {
                          return of([])
                      })),
    })
      .pipe(
        finalize(()=> loader?.dismiss())
      )
      .subscribe({
        next: (callback)=>{
          if (callback) {
            this.isSerial = callback.Serial?.Data.IsSerial ?? false;
            this.taxes = callback.Taxes?.Data;
            this.priceLists = callback.PriceList?.Data;
            this.udfsDevelopment = callback.UdfsDevelopment?.Data;
            this.udfs = (callback.UDFs as IUdfContext[] || []);
          }

        },
        error: (error)=>{
          this.commonService.Alert(AlertType.ERROR, error, error);
        }
      })
  }

  /**
   * Handles errors for HTTP requests related to serialization.
   * @param _error The HTTP error that occurred.
   * @returns An observable that emits a response object with a custom error message.
   * @private
   */
  private ErrorSerialType(_error: HttpErrorResponse):Observable<ICLResponse<ISerialType>> {
    return of({
      Data: {
        IsSerial: false
      } as ISerialType,
      Message: _error.error?.Message ?? _error.message
    } as ICLResponse<ISerialType>);
  }

  /**
   * Initializes the reactive form for item data.
   */
  LoadForm(): void {
    const validators = !this.isSerial ? [Validators.required] : [];
    this.itemForm = this.fb.group({
      ItemCode: ['', validators],
      ItemName: ['', [Validators.required]],
      UnitPrice: [''],
      U_IVA: [''],
      PriceImp: [''],
      ForeignName: ['']
    });
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
   * Filters items based on the search term and resets the pagination.
   *
   * @param _searchTerm - The string used to filter items.
   * 
   */
  async FilterItems(_searchTerm: string): Promise<void> {
    
    try {
      let loader = await this.commonService.Loader();
      loader.present();
      
      this.page = 0;
      this.isLoading = false;
      this.hasMore = true;
      this.itemMastarDataService.GetbyFilter(_searchTerm, this.page, this.pageSize)
      .pipe(
          finalize(() => loader?.dismiss())
      ).subscribe(
          {
            next: (callback => {
              this.items = [...callback.Data || []];
              this.recordsCount = this.localStorageService.data.get(HeadersData.RecordsCount) ? +this.localStorageService.data.get(HeadersData.RecordsCount): this.items.length;
              this.localStorageService.data.delete(HeadersData.RecordsCount)
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
   * Handles infinite scroll behavior when the user reaches near the bottom of the list.
   * 
   * @param _index - The index of the currently visible item in the list.
   */
  async OnScroll(_index: number) : Promise<void>{

    if (!this.items?.length || this.isLoading || !this.hasMore || this.items?.length == this.recordsCount) 
      return;
  
    if (_index < (this.items.length - this.pageSize)) 
     return;

    this.isLoading = true;

    this.page++;

    let loader = await this.commonService.Loader();
    loader.present();

    this.itemMastarDataService.GetbyFilter(this.searchTerm, this.page, this.pageSize)
    .pipe(
      finalize(() => loader?.dismiss())
    ).subscribe(
        {
          next: (callback => {
            this.items = [...this.items, ...callback.Data || []];

            if (this.items.length == this.recordsCount) {
              this.hasMore = false;
            }

            this.isLoading = false;
          }),
          error: (error)=>{
            this.commonService.alert(AlertType.ERROR, error)
          }
        }
    );
  }

  /**
   * Handles item selection and loads its detailed data 
   * 
   * @param _itemCode The selected item code to load details for.
   */
  async OnSelectItem(_itemCode: string) : Promise<void>{

    let loader = await this.commonService.Loader();
    loader.present();

    this.price.reset();
    this.barcodes = [];
    this.itemPrice = [];
    this.items = [];
    this.itemMastarDataService.Get(_itemCode)
      .pipe(
        switchMap(res => {
          this.itemForm.patchValue(res.Data)
          this.price.setValue(this.priceLists[0]);
          this.segmentValue = 'createItem';
          this.editionMode = true;
          this.currentItem = res.Data;
          let taxRate = this.taxes.find(x => x.TaxCode === res.Data.TaxCode)?.TaxRate ?? 0;
          this.itemForm.controls['U_IVA'].setValue(taxRate);
          return this.itemPriceService.Get(_itemCode, this.priceLists[0]?.ListNum ?? 0)
        }),
        switchMap(callback => {
          this.itemForm.controls['UnitPrice'].setValue(callback.Data?.Price);

          this.UpdatePrice(this.itemForm.value.UnitPrice);
          this.GetBarCodes();

          let udfKey = {
            ItemCode: _itemCode,
            TypeDocument: UdfsCategory.OITM
          } as IFilterKeyUdf;
          return this.udfsService.GetUdfsData(udfKey);
        }),
        finalize(() => loader?.dismiss()))
      .subscribe({
        next: (callback) => {
          this.udfsValues = callback.Data || [];
          //Manual change detection is added because when scanning by camera the HTML is not refreshed correctly
          this.detectorRef.detectChanges();
        },
        error: (error)=>{
          this.commonService.Alert(AlertType.ERROR, error, error);
        }
      });
  }

  /**
   * Updates the item's price based on the selected price list and tax value (U_IVA).
   * 
   */
   UpdatePrice(_value: number){
    
    const castingValue = +_value;
    
    if (castingValue >= 0) {
      let priceList: IPriceListItemMD = this.price.value;

      if (!priceList) {
        this.itemForm.controls['UnitPrice'].setValue(0);
        this.commonService.Alert(
                            AlertType.INFO,
                            'Seleccione lista de precio',
                            'Select price list'
                        );
        return;
      }

      if (!this.itemForm.value.U_IVA) {
        this.itemForm.controls['PriceImp'].setValue(castingValue);
      }

      const UNIT_PRICE = castingValue;
      const mTotal = UNIT_PRICE + UNIT_PRICE * (+this.itemForm.value.U_IVA / 100);

      this.itemForm.patchValue({PriceImp: +mTotal.toFixed(2)});

      if (this.itemPrice && this.itemPrice.length > 0 && this.itemPrice.some(x => x.PriceList === +priceList.ListNum)) {
        let index = this.itemPrice.findIndex(x => x.PriceList === +priceList.ListNum);
        if (index != -1)
          this.itemPrice[index].Price = castingValue;

      } else {
        let price: ItemPrice = {
          Price: this.itemForm.controls['UnitPrice'].value,
          Currency: priceList.PrimCurr,
          PriceList: priceList.ListNum
        }

        this.itemPrice.push(price);
      }
    }
  }

  /**
   * Get item barcode
   */
  async GetBarCodes (): Promise<void> {
    if (this.currentItem.ItemCode) {
      let loader = await this.commonService.Loader();
      loader.present();
      this.barcodesService.Get(this.currentItem.ItemCode)
        .pipe(
          finalize(() =>loader?.dismiss())
        ).subscribe({
        next: (callback) => {
          this.barcodes = callback.Data;
          this.barcodes.forEach((x, index) => {
            x.Id = index + 1;
          });
        },
        error: (error)=>{
          this.commonService.Alert(AlertType.ERROR, error, error);
        }
      });
    }

  }

  /**
   * Opens an alert dialog for the user to enter a new barcode and description.
   */
  async AddBarcode() {
    const alert = await this.alertController.create({
      header: this.commonService.Translate('Nuevo Código', 'New Code') ,
      inputs: [
        {
          name: 'Barcode',
          placeholder: this.commonService.Translate('Código', 'Code'),
          type: 'text'
        },
        {
          name: 'FreeText',
          placeholder: this.commonService.Translate('Descripción', 'Description'),
          type: 'text'
        }
      ],
      buttons: [
        {
          text: this.commonService.Translate('Cancelar', 'Cancel'),
          role: 'cancel'
        },
        {
          text: this.commonService.Translate('Guardar', 'Save'),
          handler: (data : ItemBarCodeCollection) => {
            return this.AddOrEditBarcode(data);
          }
        }
        ]});

    await alert.present();
  }

  /**
 * Opens an alert dialog to edit an existing barcode.
 * 
 * @param _bardcode - The barcode object to be edited.
 */
  async EditBarcode(_bardcode: ItemBarCodeCollection) {
    let editCode = this.barcodes.some(x => x.AbsEntry === _bardcode.AbsEntry && _bardcode.AbsEntry != -1);

    const alert = await this.alertController.create({
      header: this.commonService.Translate('Editar Código', 'Edit Code'),
      inputs: [
        {
          name: 'Barcode',
          placeholder: this.commonService.Translate('Código', 'Code'),
          type: 'text',
          disabled: editCode,
          value: _bardcode.Barcode,
        },
        {
          name: 'FreeText',
          placeholder: this.commonService.Translate('Descripción', 'Description'),
          type: 'text',
          value: _bardcode.FreeText,
        }
      ],
      buttons: [
        {
          text: this.commonService.Translate('Cancelar', 'Cancel'),
          role: 'cancel'
        },
        {
          text: this.commonService.Translate('Guardar', 'Save'),
          handler: (data : ItemBarCodeCollection) => {
            return this.AddOrEditBarcode(data);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Adds a new barcode or updates an existing one in the local barcode list.
   * 
   * @param _bardcode - The barcode object to be added or edited.
   * @returns `true` if the operation is successful, `false` if validation fails.
   */
  AddOrEditBarcode(_bardcode: ItemBarCodeCollection) : boolean{
    if(!_bardcode?.Barcode){
      this.commonService.Alert(
                    AlertType.INFO,
                    'El código no puede estar vacío',
                    'The code cannot be empty'
                );
      return false;
    }

    let index = this.barcodes.findIndex(x => x.Barcode.toLowerCase() === _bardcode?.Barcode?.toLowerCase())

    if (index >= 0) {
      this.barcodes[index].Barcode = _bardcode?.Barcode;
      this.barcodes[index].FreeText = _bardcode?.FreeText;
    } else {
      this.barcodes.push({
        Id: 0,
        Barcode: _bardcode?.Barcode,
        FreeText: _bardcode?.FreeText,
        UoMEntry: -1,
        AbsEntry: -1
      });
    }

    this.barcodes.forEach((x, index) => {
      x.Id = index + 1;
    });

    return true
  }

  /**
   * Shows a confirmation dialog to delete a barcode.
   * 
   * @param _bardcode - The barcode object to be deleted.
   */
  async DeleteBarcode(_bardcode: ItemBarCodeCollection) {
    const alert = await this.alertController.create({
      header: this.commonService.Translate('Confirmar Eliminación', 'Confirm Deletion') ,
      message: `¿${this.commonService.Translate('Estás seguro de eliminar el código', 'Are you sure you want to delete the code')} <strong>${_bardcode.Barcode}</strong>?`,
      buttons: [
        {
          text: this.commonService.Translate('Cancelar', 'Cancel'),
          role: 'cancel'
        },
        {
          text: this.commonService.Translate('Eliminar', 'Delete'),
          cssClass: 'danger',
          handler: () => {
            this.DeleteCode(_bardcode);
          }
        }
      ]
    });

    await alert.present();
  }

  
  /**
   * Deletes a barcode from the local list if it was not previously created in SAP.
   * 
   * @param _bardcode - The barcode object to be deleted.
   */  
  DeleteCode(_bardcode: ItemBarCodeCollection) {
    if (_bardcode.AbsEntry > 0) {
      this.commonService.Alert(
                            AlertType.INFO,
                            'Este código de barras no se puede eliminar, ya que este ha sido previamente creado en SAP.',
                            'This barcode cannot be deleted, as it has been previously created in SAP.'
                        );
      return
    }

    this.barcodes.splice(_bardcode.Id - 1, 1);
    this.barcodes.forEach((x, index) => {
      x.Id = index + 1;
    });
  }

  /**
   * Checks if the current user has a specific permission.
   *
   * @param permision - The name of the permission to verify.
   * @returns `true` if the user has the permission, `false` otherwise.
   *
   */
  VerifyPermission(permision: string): boolean {
        return !this.permisionList.some((perm) => perm.Name === permision);
  }

  /**
   * Method is executed when changing price list
   * @param _event - Price list selected
   * @constructor
   */
   async GetItemPrices(_event: any): Promise<void> {
    let priceList: IPriceListItemMD = _event?.target?.value;

    if (!this.itemForm.controls['ItemCode'].value) {
      
      if (this.itemPrice && this.itemPrice.length > 0 && this.itemPrice.some(x => x.PriceList === +priceList.ListNum)) {
        let index = this.itemPrice.findIndex(x => x.PriceList === +priceList.ListNum);

        if (index != -1)
          this.itemForm.controls['UnitPrice'].setValue(this.itemPrice[index].Price);

      } else {
        this.itemForm.controls['UnitPrice'].setValue(0);
      }

      this.UpdatePrice(this.itemForm.value.UnitPrice);
      return;
    }

    let loader = await this.commonService.Loader();
    loader.present();

    this.itemPriceService.Get(this.itemForm.controls['ItemCode'].value, +priceList.ListNum)
      .pipe(finalize(() => loader?.dismiss()))
      .subscribe({
        next: (callback) => {
          this.itemForm.controls['UnitPrice'].setValue(callback.Data.Price);
          this.UpdatePrice(this.itemForm.value.UnitPrice);
        }
      });
  }


  /**
   * Updates the unit price based on the entered price with tax (PriceImp) and selected tax rate (U_IVA).
   * 
   */
  UpdatePriceImp(event: any): void {

    const value = event?.target?.value ?? 0;

    if (+value > 0) {

      let priceList: IPriceListItemMD = this.price.value;

      if (!priceList) {
        this.itemForm.controls['PriceImp'].setValue(0);
        this.commonService.Alert(AlertType.WARNING, 'Seleccione lista de precio', 'Select price list');
        return;
      }

      if (!this.itemForm.value.U_IVA) {
        this.itemForm.controls['PriceImp'].setValue(0);
        this.commonService.Alert(AlertType.WARNING, 'Seleccione impuesto', 'Select tax');
        return;
      }

      const mTotal = +value / (1 + this.itemForm.value.U_IVA / 100);
      this.itemForm.patchValue({UnitPrice: +mTotal.toFixed(2)});

      if (this.itemPrice && this.itemPrice.length > 0 && this.itemPrice.some(x => x.PriceList === +priceList.ListNum)) {

        let index = this.itemPrice.findIndex(x => x.PriceList === +priceList.ListNum);
        if (index != -1)
          this.itemPrice[index].Price = this.itemForm.value.UnitPrice;
      } else {
        let price: ItemPrice = {
          Price: this.itemForm.controls['UnitPrice'].value,
          Currency: priceList.PrimCurr,
          PriceList: priceList.ListNum
        }

        this.itemPrice.push(price);
      }
    }

  }

  /**
   * Update the price when IVA changes
   */
  OnTaxChange() {
     if (this.ignoreTaxChange) return

    this.UpdatePrice(this.itemForm.controls['UnitPrice'].value);
  }

  /**
   * Resets the form and all related properties to their initial states.
   *
   */
  ResetData(){
    this.ignoreTaxChange = true;
    this.editionMode = false;
    this.price?.reset();
    this.itemForm.reset();
    this.barcodes = [];
    this.itemPrice = [];
    this.searchTerm = '';
    this.currentItem = null;
    this.barcodes = [];
    this.udfsValues = [];
    this.isBarcodeToggled = false;
    this.udfPresentationComponent?.resetUDFs();
    setTimeout(() => this.ignoreTaxChange = false); // Deja pasar un ciclo

  }

  /**
   * Toggles the visibility or activation state of the barcode section.
   *
   */
  ToggleBarcode(): void {
    this.isBarcodeToggled = !this.isBarcodeToggled;
  }

   /**
   * This method is for set data udfs
   * @constructor
   */
  GetValuesUDFs(): IUdf[] {
      let UDFList: IUdf[] = [];

      const valuesUDFs = this.udfPresentationComponent?.GetValuesUDFs() || [];

      if (Array.isArray(valuesUDFs)) {
          UDFList = valuesUDFs
              .map(([key, value]) => ({ Name: key, FieldType: '', Value: value } as IUdf));
      }

      UDFList.push({ 
        Name: 'U_IVA', 
        FieldType: '',
        Value: this.taxes.find(x => x.TaxRate === this.itemForm.value.U_IVA)?.TaxCode ?? '' 
      } as IUdf)
    
      return UDFList;
  }
  
  /**
   * Saves changes made to the item by either creating a new item or updating an existing one.
   *
   * @returns A `Promise<void>` that resolves once the save operation is complete.
   */
  async SaveChanges(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    let item = this.itemForm.getRawValue() as IItemMasterData;
    item.ItemBarCodeCollection = this.barcodes;
    item.ItemPrices = this.itemPrice;
    item.Udfs = this.GetValuesUDFs();


    let updateOrCreate$: Observable<ICLResponse<IItemMasterData>> | null = null;

    if (this.editionMode) {
      updateOrCreate$ = this.itemService.Patch(item);
    } else {
      updateOrCreate$ = this.itemService.Post(item);
    }

    updateOrCreate$
      .pipe(
        finalize(() => loader?.dismiss())
      ).subscribe({
      next: () => {
        this.commonService.Alert(
                            AlertType.SUCCESS,
                            this.editionMode? 'Ítem actualizado correctamente' :'Ítem creado correctamente' ,
                            this.editionMode?  'Item updated successfully' : 'Item created successfully'
                        );
        this.ResetData();
      },
      error: (error) => {
        this.commonService.Alert(AlertType.ERROR, error, error);
      }
    });
  }

  /**
   *  Sets the state of the scanner visibility.
   * @param _isScanner
   * @constructor
   */
  IsOpenScanner( _isScanner: boolean){
      this.showScanner = _isScanner
      this.detectorRef.detectChanges();
  }

  /**
   * Processes the value from the scanner.
   * @param _scanedValue
   * @constructor
   */
  ScannedItem(_scanedValue: string){
    if(this.segmentValue == 'searchItem'){
      this.OnSelectItem(_scanedValue);
    }else{
      const barCode = {
        Barcode: _scanedValue
      } as ItemBarCodeCollection;

      this.AddOrEditBarcode(barCode);
    }
  }

  /**
   * Opens inventory details modal
   * @returns {Promise<void>} Displays modal with current item details
   */
  async OpenInventoryModal() {
    const modal = await this.modalController.create({
      component: InventoryDetailsComponent,
      componentProps: {
        itemData: this.currentItem,
      },
      cssClass: 'custom-modal',
    });

    await modal.present();
  }

  /**
   * Init items value for to search
   */
  InitItems(){
    this.items = [];
  }


}





