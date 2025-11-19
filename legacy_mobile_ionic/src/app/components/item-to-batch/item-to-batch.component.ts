
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppConstants, LogEvent } from 'src/app/common';
import { IItemToBatch, IWarehouse } from 'src/app/models';
import { IBinRequest, IBinStock } from 'src/app/models/db/i-bin';
import { ISelectBinAllocationsComponentInputData } from 'src/app/models/db/i-modals-data';
import { SLBatch } from 'src/app/models/db/product-model';
import { CommonService, LogManagerService } from 'src/app/services';
import { CustomModalController } from 'src/app/services/custom-modal-controller.service';
import { SelectBinAllocationsComponent } from '../select-bin-allocations/select-bin-allocations.component';

@Component({
  selector: 'app-item-to-batch',
  templateUrl: './item-to-batch.component.html',
  styleUrls: ['./item-to-batch.component.scss'],
})
export class ItemToBatchComponent implements OnInit, OnDestroy {
  //VARBOX
  binAllocations: IBinRequest[];
  delayedItemsToBatch: IItemToBatch[];
  itemsToBatch: IItemToBatch[];
  warehouses: IWarehouse[];
  batchesToBeCommited: IItemToBatch[];
  @Input("data") data: any;

  constructor(
    private modalController: CustomModalController
    , private commonService: CommonService
    , private logManagerService: LogManagerService
  ) { }
  ngOnDestroy(): void {
    this.modalController.DismissAll();
  }

  ngOnInit() {
    this.LoadData();
  }


  /* Dismiss the modal */
  async Dismiss() {
    this.modalController.dismiss({ completedBatches:  this.batchesToBeCommited }, "cancel");
  }

  /** 
   * Dismiss the modal and returns the batches to be commited
   */
  async Continue(): Promise<void> {
    try {
      this.modalController.dismiss({ completedBatches:  this.batchesToBeCommited, allocations: this.binAllocations.filter(x => x.Quantity > 0) }, "success");
    }
    catch (error) {
      console.info(error);
      this.logManagerService.Log(LogEvent.ERROR, AppConstants.GetError(error), `ItemToBatchComponent Over ${this.data.DocType}`);
    }
  }

  
  /** 
   * Loads the data from the input and initializes the component
   */
  async LoadData(): Promise<void> {
    try {
      this.binAllocations = this.data?.binAllocations ?? [];

      this.itemsToBatch = this.data?.itemsToBatch ?? [];

      this.delayedItemsToBatch = this.data?.delayedItemsToBatch ?? [];

      this.batchesToBeCommited = this.CloneValuesOfItemsToBatch();

      this.MatchBatches();

      this.warehouses = this.data?.warehouses ?? [];
    }
    catch (error) {
      console.info(error);
      this.logManagerService.Log(LogEvent.ERROR, AppConstants.GetError(error), `ItemToBatchComponent Over ${this.data.DocType}`);
    }
  }

  /** 
   * Sets the difference on user input clicks 
   */
  async SetQuantityDifference(_item: IItemToBatch, _batchNum: string, _batchIndex: number, _productIndex: number, _isFromCheck = false): Promise<void> {
    try {
      let isWithAllocations = false;
      // VALIDAR SI EL LOTE TIENE UBICACIONES
      let currentBatchBinAllocations: IBinRequest[] = this.binAllocations.filter(x => x.BatchNumber === _batchNum);

      if(this.HasBinAllocations(_batchNum) && !_isFromCheck){
        let modal = await this.modalController.create({
          component: SelectBinAllocationsComponent,
          componentProps: {
            data: {
              Requested: _item.Quantity,
              BinAllocations: currentBatchBinAllocations
            } as ISelectBinAllocationsComponentInputData,
          },
        });

        modal.present();

        let result = await modal.onDidDismiss();

        if(result.role === "success"){
          currentBatchBinAllocations = result.data;
          
          currentBatchBinAllocations.forEach(bin => {
            let binAllocation = this.binAllocations.find(x => x.BatchNumber === _batchNum && x.BinAbs === bin.BinAbs);
            if(binAllocation){
              binAllocation.Quantity = bin.Quantity;
            }
          });

          (<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value = `${currentBatchBinAllocations.reduce((acc, cur) => acc + cur.Quantity, 0)}`;
          isWithAllocations = true;
        } else {
          return;
        }
      }

      let VALUE_TO_WRITE = isNaN(+(<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value)
        ? 0 
        : +(<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value;

      const TARGETED_ITEM = this.batchesToBeCommited.find(x => x.Index === _productIndex);//this.itemsToBatch.find(x => x.Index === _productIndex);

      const TARGETED_DUPLICATE_ITEMS = this.batchesToBeCommited.filter(x => x.ItemCode === TARGETED_ITEM.ItemCode && x.Hash !== TARGETED_ITEM.Hash);//this.itemsToBatch.filter(x => x.ItemCode === TARGETED_ITEM.ItemCode && x.Hash !== TARGETED_ITEM.Hash);

      const COPY_BATCH = this.batchesToBeCommited.find(x => x.Index === _productIndex).Batches.find((x) => x.BatchNumber === _batchNum);

      const ORIGINAL_BATCH = this.itemsToBatch.find(x => x.Index === _productIndex).Batches.find((x) => x.BatchNumber === _batchNum);
      
      const DUPLICATE_BATCHES = TARGETED_DUPLICATE_ITEMS.map(item => item.Batches.find(batch => batch.BatchNumber === ORIGINAL_BATCH.BatchNumber));

      const DUPLICATE_BATCHES_APPLIED = DUPLICATE_BATCHES.reduce((sum, batch) => sum + batch.Quantity, 0);

      const AMOUNT_TO_ACHIVE = isNaN(TARGETED_ITEM.Quantity) ?  ORIGINAL_BATCH.Quantity : TARGETED_ITEM.Quantity;

      const WAREHOUSE_AVAILABLE = ORIGINAL_BATCH.Quantity <= DUPLICATE_BATCHES_APPLIED ? ORIGINAL_BATCH.Quantity : ORIGINAL_BATCH.Quantity - DUPLICATE_BATCHES_APPLIED;
      
      const TOTAL_APPLIED = this.GetTotalApplied(_productIndex);

      const SUMMARIZED_BATCHES_AMOUNT = isNaN(TOTAL_APPLIED) ? 0 : TOTAL_APPLIED;

      const PREVIUS_QUANTITY_APPLIED_VALUE = TARGETED_ITEM.Batches.find(x => x.BatchNumber === _batchNum && TARGETED_ITEM.ItemCode === _item.ItemCode).Quantity;
      
      let differentAmount = isNaN(AMOUNT_TO_ACHIVE - SUMMARIZED_BATCHES_AMOUNT) ? 0 : (AMOUNT_TO_ACHIVE - SUMMARIZED_BATCHES_AMOUNT);
      
      if(differentAmount < PREVIUS_QUANTITY_APPLIED_VALUE)
      {
        if((differentAmount + PREVIUS_QUANTITY_APPLIED_VALUE) <= WAREHOUSE_AVAILABLE)
        {
          differentAmount += PREVIUS_QUANTITY_APPLIED_VALUE;
        }
        else
        {
          differentAmount = WAREHOUSE_AVAILABLE;
        }
      }
      else
      {
          if((differentAmount + PREVIUS_QUANTITY_APPLIED_VALUE) <= AMOUNT_TO_ACHIVE)
          {
            differentAmount += PREVIUS_QUANTITY_APPLIED_VALUE;
          }
      }

      if(differentAmount == PREVIUS_QUANTITY_APPLIED_VALUE)
      {
          differentAmount += PREVIUS_QUANTITY_APPLIED_VALUE;
      }
      
      const AMOUNT_TO_BE_COMMITED = differentAmount <= WAREHOUSE_AVAILABLE ? differentAmount : WAREHOUSE_AVAILABLE;

      let valueToWrite = AMOUNT_TO_BE_COMMITED;

      if(DUPLICATE_BATCHES_APPLIED >= ORIGINAL_BATCH.Quantity)
      {
        this.commonService.toast(this.commonService.Translate("El lote no tiene suficientes unidades", "Batch without units to commit request"), 'dark', 'bottom');

        (<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value = PREVIUS_QUANTITY_APPLIED_VALUE.toString();

        return;
      }

      if (VALUE_TO_WRITE < 0) 
      {
        this.commonService.toast(this.commonService.Translate(`No se permiten cantidades negativas`, `Negative amounts not allowed`), 'dark', 'bottom');
        
        (<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value = PREVIUS_QUANTITY_APPLIED_VALUE.toString();
        
        return;
      }

      // Checks for user manual entry
      if (_isFromCheck) 
      {
        if (VALUE_TO_WRITE > ORIGINAL_BATCH.Quantity) 
        {
            this.commonService.toast(this.commonService.Translate(`El lote no tiene suficientes unidades`, `Batch without units to commit request`), 'dark', 'bottom');

            (<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value = PREVIUS_QUANTITY_APPLIED_VALUE.toString();

            return; 
        }

        if (VALUE_TO_WRITE > ORIGINAL_BATCH.Quantity &&  (SUMMARIZED_BATCHES_AMOUNT - VALUE_TO_WRITE) > 0 &&  (SUMMARIZED_BATCHES_AMOUNT - VALUE_TO_WRITE) < TARGETED_ITEM.Quantity) 
        {
          this.commonService.toast(this.commonService.Translate(`Cantidad de unidades solicitada excedida`, `Requested amount exceed`), 'dark', 'bottom');

          (<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value = PREVIUS_QUANTITY_APPLIED_VALUE.toString();

          return; 
        }
        
        valueToWrite = VALUE_TO_WRITE;

        if((DUPLICATE_BATCHES_APPLIED + VALUE_TO_WRITE) > ORIGINAL_BATCH.Quantity)
        {
          valueToWrite = WAREHOUSE_AVAILABLE;
        }
      }

      if(isWithAllocations){
        valueToWrite = VALUE_TO_WRITE;

        if((DUPLICATE_BATCHES_APPLIED + VALUE_TO_WRITE) > ORIGINAL_BATCH.Quantity)
        {
          valueToWrite = WAREHOUSE_AVAILABLE;
        }
      }

      (<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value = valueToWrite.toString();

      COPY_BATCH.Quantity = valueToWrite;
      // Rollback setted values on inconsistencies of units
      if (this.GetTotalApplied(_productIndex) > TARGETED_ITEM.Quantity) 
      {
        this.commonService.toast(this.commonService.Translate(`Cantidad de unidades solicitada excedida`, `Requested amount exceed`), 'dark', 'bottom');

        (<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value = PREVIUS_QUANTITY_APPLIED_VALUE.toString();

        COPY_BATCH.Quantity = PREVIUS_QUANTITY_APPLIED_VALUE;
      }

      if(_isFromCheck) (<HTMLElement>document.activeElement).blur();
    }
    catch (error) 
    {
      console.info(error);
      this.logManagerService.Log(LogEvent.ERROR, AppConstants.GetError(error), `ItemToBatchComponent Over ${this.data.DocType}`);
    }
  }

  GetWarehouseName(_whsCode): string {
    try {
      return this.warehouses.find(x => x.WhsCode === _whsCode).WhsName;
    }
    catch (error) {
      this.logManagerService.Log(LogEvent.ERROR, AppConstants.GetError(error), `ItemToBatchComponent Over ${this.data.DocType}`);
      console.info(error);
      return this.commonService.Translate(`Almacén no encotrado`, `Warehouse not found`);
    }
  }

  GetTotalApplied(_itemIndex: number): number { // This function looks good
    try {
      const FILTERED_BATCHES = this.batchesToBeCommited.find(x => x.Index === _itemIndex).Batches;//this.itemsToBatch.find(x => x.Index === _itemIndex).Batches;
      
      const RESULT = FILTERED_BATCHES.reduce(function (acc, batch) { return acc + batch.Quantity; }, 0);

      return RESULT;
    }
    catch (error) {
      this.logManagerService.Log(LogEvent.ERROR, AppConstants.GetError(error), `ItemToBatchComponent Over ${this.data.DocType}`);
      console.info(error);
      return -1;
    }
  }

  /** 
   * Checks if the user havent save changes on applied quantities
   */
  GetUnCommitedValue(_batchIndex: number, _productIndex: number, _batchNum: string): boolean {
    try {
      const TARGETED_ITEM = this.batchesToBeCommited.find(x => x.Index === _productIndex);

      const BATCH = TARGETED_ITEM.Batches.find((x) => x.BatchNumber === _batchNum);

      return +(<HTMLInputElement>document.getElementById(`input_${_batchIndex}_${_productIndex}`)).value !== BATCH.Quantity;
    }
    catch (error) {
      this.logManagerService.Log(LogEvent.ERROR, AppConstants.GetError(error), `ItemToBatchComponent Over ${this.data.DocType}`);
      console.info(error);
      return false;
    }
  }

  /** 
   * Checks if there are loaded batches and sets applied quantities
   * to new ones
   */
  MatchBatches(): void {
    try {

      this.SetValuesToBatches();

      this.RenderMatchedBatches();
    }
    catch (error) {
      console.info(error);
    }
  }

  RenderMatchedBatches(): void {
    try {
      this.batchesToBeCommited.forEach((x, xindex) => {
        x.Batches.forEach((y, yindex) => {
          setTimeout(_=> {
            (<HTMLInputElement>document.getElementById(`input_${yindex}_${xindex}`)).value = y.Quantity ? y.Quantity.toString() : "";
          });
        });
      });
    }
    catch (error) {
      console.info(error);
    }
  }

  /**
   * It establishes the quantity applied to the batches with the values of the batches sent, in case no batches are sent, it will be set to 0
   */
  SetValuesToBatches(): void{
    if(this.delayedItemsToBatch.length)
    {
      this.delayedItemsToBatch.forEach((x) => {

        this.batchesToBeCommited.find((item) => item.Hash === x.Hash).Batches.forEach((y) => {
          
          const CURRENT_BATCH: SLBatch = x.Batches.find(z => z.BatchNumber === y.BatchNumber);
          
          if(CURRENT_BATCH)
          {
            y.Quantity = CURRENT_BATCH.Quantity;
          }
          else
          {
            y.Quantity = 0;
          }
          
        });
      });
    }
    else
    {
      this.batchesToBeCommited.forEach(bc => {
        bc.Batches.forEach(b => {
          b.Quantity = 0;
        });
      });
    }
  }
  /**
   * Make all item array properties immutable for batches
   * @returns Returns a copy of the array of items for batches
   */
  CloneValuesOfItemsToBatch(): IItemToBatch[]{
    return this.itemsToBatch.map(o => {
      let batches: SLBatch[] = Object.assign([], o.Batches.map(c => Object.assign({}, c)));

      let obj: IItemToBatch = {...o};

      obj.Batches = [...batches];

      return obj;
    });
  }

  HasBinAllocations(_batchNumber: string): boolean{
    return this.binAllocations.some(x => x.BatchNumber === _batchNumber);
  }

}
