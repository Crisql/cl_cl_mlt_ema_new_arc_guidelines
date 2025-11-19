import {Component, Input, OnInit} from '@angular/core';
import {IStockTransferRowsSelected, IStockTransferRowsWithBatches} from "../../../../interfaces/i-stock-transfer";
import {forkJoin, of} from "rxjs";
import {BatchesService} from "../../../../services/batches.service";
import {catchError, finalize} from "rxjs/operators";
import {AlertType, AppConstants, LogEvent} from "../../../../common";
import {CommonService} from "../../../../services";
import {IBatches, ILocationsModel} from "../../../../models/db/product-model";
import {ModalController} from "@ionic/angular";
import {FilterDataComponent} from "../../../filter-data/filter-data.component";
import {IBinLocation} from "../../../../interfaces/i-BinLocation";
import {CustomModalController} from "../../../../services/custom-modal-controller.service";

@Component({
  selector: 'app-select-batch-items',
  templateUrl: './select-batch-items.component.html',
  styleUrls: ['./select-batch-items.component.scss'],
})
export class SelectBatchItemsComponent implements OnInit {

  @Input('batchedItems') batchedItems: IStockTransferRowsWithBatches[];

  constructor(private batchesService: BatchesService,
              private commonService: CommonService,
              private modalController: ModalController,
              private modalCtrl: CustomModalController,) {
  }

  ngOnInit() {
    this.LoadData();
  }

  async LoadData() {
    let loader = await this.commonService.Loader();
    loader.present();

    const requests = this.batchedItems.map(_item => {
          let BinAbsOrigin = _item.LocationsFrom && _item.LocationsFrom.length > 0 ? _item.LocationsFrom[0].AbsEntry : 0;
          return this.batchesService.GetBatchesForTransfer(_item.ItemCode, _item.FromWarehouseCode, BinAbsOrigin).pipe(
              catchError(() => of(null)))
        }
    );

    forkJoin(requests)
        .pipe(finalize(() => loader.dismiss()))
        .subscribe({
          next: (responses) => {
            if (!responses || responses.length == 0) {
              this.commonService.Alert(AlertType.INFO, 'No se obtuvieron lotes', 'No lots obtained');
              return
            }
            responses.forEach((response, index) =>{
              this.batchedItems[index].Batches = response['Data'] as IBatches[] || []
            })
          },
          error: (error) => this.commonService.alert(AlertType.ERROR, error)
        });
  }

  /**
   * Calculates the total applied quantity for a given stock transfer item by summing batch quantities.
   * Returns -1 if an error occurs.
   * @param {IStockTransferRowsWithBatches} _item - The stock transfer item with batch details.
   * @returns {number} - The total applied quantity or -1 if an error occurs.
   */
  GetTotalApplied(_item: IStockTransferRowsWithBatches): number {
    try {
      return _item?.Batches?.reduce((acc, batch) => acc + (batch?.Quantity || 0), 0) || 0;
    }
    catch (error) {
      this.commonService.alert(AlertType.ERROR, error)
      return -1;
    }
  }

  /**
  * Sets the difference on user input clicks
  */
  async SetQuantityDifference(_item: IStockTransferRowsSelected, _batch: IBatches): Promise<void> {

    if (!_batch.Locations) {
      this.commonService.toast(this.commonService.Translate(`Ítem no manejado con ubicaciones`, `Item not managed with locations`), 'dark', 'bottom');
      return;
    }


    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          locations: [..._batch.Locations],
          requiredQuantity: _item.Quantity
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<ILocationsModel[]>().then((result) => {
        if(result.data){
          _batch.Quantity = result.data.reduce((acumulador, valor) => acumulador + (valor.Quantity ? valor.Quantity : 0), 0);
          _batch.Locations = [...result.data];
        }
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
    }
  }
  
  async Dismiss() {
    this.modalController.dismiss()
  }

  /**
   * This method is used to change data of the form to update models
   * @constructor
   */
  ChangeData(batch: IBatches, itemBatch: IStockTransferRowsWithBatches): void {
    if(!batch.Quantity){
      return
    }
    if(batch.Quantity > batch.Disponible){
      this.commonService.toast(this.commonService.Translate(`La cantidad no puede ser mayor al disponible`, `The amount cannot be greater than the amount available`), 'dark', 'bottom');
      batch.Quantity = 0;
      return;
    }
    if (batch.Quantity > itemBatch.Quantity ) {
      this.commonService.toast(this.commonService.Translate(`La cantidad no puede ser mayor a la solicitada`, `The amount cannot be greater than that requested`), 'dark', 'bottom');
      return;
    }
  }

  /**
   * Validates batch item quantities against requested quantities, updating each item's
   * batch numbers and bin allocations if valid. Closes the modal with updated batch items.
   */
  async Continue(): Promise<void> {

    const hasInvalidItem = this.batchedItems.some(batchItem => {
      if(this.GetTotalApplied(batchItem) > batchItem.Quantity){
        this.commonService.Alert(AlertType.INFO, `La cantidad del producto <b>${batchItem.ItemCode} - ${batchItem.ItemDescription}</b> no puede ser mayor a la solicitada`, `The quantity of product <b>${batchItem.ItemCode} - ${batchItem.ItemDescription}</b> cannot be greater than that requested`);
        return false;
      }

      if(this.GetTotalApplied(batchItem) < batchItem.Quantity){
        this.commonService.Alert(AlertType.INFO, `La cantidad del producto <b>${batchItem.ItemCode} - ${batchItem.ItemDescription}</b>  no puede ser menor a la solicitada`, `The quantity of product <b>${batchItem.ItemCode} - ${batchItem.ItemDescription}</b> cannot be less than the requested quantity`);
        return false;
      }
      return true;
    });
    
    if(!hasInvalidItem){
      return
    }  
    
    this.batchedItems.forEach(batchItem=>{
      batchItem.BatchNumbers = batchItem.Batches.filter(x => x.Quantity && x.Quantity > 0).map((element: IBatches) => {
        return {
          BatchNumber: element.DistNumber,
          SystemSerialNumber: element.SysNumber,
          Quantity: element.Quantity
        }
      });

      if (!batchItem.StockTransferLinesBinAllocations){
        batchItem.StockTransferLinesBinAllocations = [];
      }


      batchItem.StockTransferLinesBinAllocations = batchItem.StockTransferLinesBinAllocations
          ?.filter(x => x.BinActionType === 'batFromWarehouse') || [];

      if (batchItem.StockTransferLinesBinAllocations.length > 0) {
        batchItem.StockTransferLinesBinAllocations[0].SerialAndBatchNumbersBaseLine = 0;
      }
      
      if(batchItem.BinAbsDestino){
        batchItem.BatchNumbers.forEach((element, index = batchItem.StockTransferLinesBinAllocations.length) => {
          batchItem.StockTransferLinesBinAllocations.push({
            BinAbsEntry: batchItem.BinAbsDestino,
            Quantity: element.Quantity,
            BaseLineNumber:  ((batchItem.Id || 0) - 1),
            SerialAndBatchNumbersBaseLine: index,
            BinActionType: 'batToWarehouse'
          });
        });
      }
      
    })
    
    this.modalController.dismiss(this.batchedItems);
  }
  
  

}
