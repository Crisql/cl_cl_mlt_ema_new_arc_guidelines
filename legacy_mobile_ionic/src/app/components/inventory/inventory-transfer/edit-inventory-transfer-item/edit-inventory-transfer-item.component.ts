import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ModalController} from "@ionic/angular";
import {IStockTransferRequestRows} from "../../../../interfaces/i-stock-transfer-request";
import {IWarehouse} from "../../../../models";
import {CustomModalController} from "../../../../services/custom-modal-controller.service";
import {CommonService} from "../../../../services";
import {FilterDataComponent} from "../../../filter-data/filter-data.component";
import {AlertType} from "../../../../common";
import {IStockTransferLinesBinAllocations, IStockTransferRowsSelected} from "../../../../interfaces/i-stock-transfer";
import {IBinLocation} from "../../../../interfaces/i-BinLocation";

@Component({
  selector: 'app-edit-inventory-transfer-item',
  templateUrl: './edit-inventory-transfer-item.component.html',
  styleUrls: ['./edit-inventory-transfer-item.component.scss'],
})
export class EditInventoryTransferItemComponent implements OnInit {
  
  @Input('item')  item: IStockTransferRowsSelected;

  itemForm: FormGroup;

  itemEdit: IStockTransferRowsSelected;
  constructor(private modalController: ModalController,
              private modalCtrl: CustomModalController,
              private commonService: CommonService) { }

  ngOnInit() {
    this.LoadForm();
    this.itemEdit = this.item;
    this.LoadInitialData();
  }

  LoadForm(): void {
    this.itemForm = new FormGroup({
      ItemCode: new FormControl(''),
      ItemDescription: new FormControl(''),
      Quantity: new FormControl(0),
      FromNameWhsCode: new FormControl(''),
      ToNameWarehouse: new FormControl(''),
      BinAbsNameOrigin: new FormControl(''),
      BinAbsNameDestino: new FormControl(''),
      DistNumber: new FormControl(''),
    });
  }

  /**
   * This method is used load initial data
   * @constructor
   * @private
   */
  LoadInitialData() {
    this.itemForm.patchValue({
      ...this.itemEdit,
      BinAbsNameOrigin: this.itemEdit.LocationsFrom?.find(location=> location.AbsEntry == this.itemEdit?.BinAbsOrigin)?.BinCode || '',
      BinAbsNameDestino: this.itemEdit.LocationsTo?.find(location=> location.AbsEntry == this.itemEdit?.BinAbsDestino)?.BinCode || '',
    })
  }

  /**
   * Opens a modal to select a location origin
   */
  async SearchBinLocationOrigin() {
    if(this.itemEdit.LocationsFrom.length == 0){
      this.commonService.toast(this.commonService.Translate(`No hay ubicaciones de origen para seleccionar`, `There are no source locations to select`), 'dark', 'bottom');
      return;
    }

    const locationsFrom = this.itemEdit.FromWarehouseCode == this.itemEdit.WarehouseCode ?
        this.itemEdit.LocationsFrom?.filter(location => location.AbsEntry != this.itemEdit?.BinAbsDestino):
        this.itemEdit.LocationsFrom;

    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData: locationsFrom,
          inputTitle: "INVENTORY.SEARCH LOCATION ORIGIN",
          inputFilterProperties: ['BinCode']
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IBinLocation>().then((result) => {
        if(result.data){
          this.itemEdit.BinAbsOrigin = result.data?.AbsEntry || 0;
          this.itemEdit.Stock = this.itemEdit.OnHandByBin?.find(location => location.AbsEntry=== result.data?.AbsEntry)?.OnHandQty ?? this.itemEdit.Stock;
          
          if(this.itemEdit.ManBtchNum == 'N'){
            let index = this.itemEdit.StockTransferLinesBinAllocations?.findIndex(x => x.BinActionType === 'batFromWarehouse') || -1;

            if (index < 0) {
              this.itemEdit.StockTransferLinesBinAllocations.push({
                BinActionType: 'batFromWarehouse',
                BinAbsEntry: this.itemEdit.BinAbsOrigin,
                Quantity: this.itemEdit.Quantity,
                BaseLineNumber: ((this.itemEdit?.Id || 0) - 1),
                SerialAndBatchNumbersBaseLine: 0
              } as IStockTransferLinesBinAllocations)
            } else {
              this.itemEdit.StockTransferLinesBinAllocations[index].BinAbsEntry = this.itemEdit.BinAbsOrigin ?? -1;
            }
          }
          this.itemForm.controls['BinAbsNameOrigin'].patchValue(result.data?.BinCode || '');
        }
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
    }
  }


  /**
   * Opens a modal to select a location destination
   */
  async SearchBinLocationDestination() {
    if(this.itemEdit.LocationsTo.length == 0){
      this.commonService.toast(this.commonService.Translate(`No hay ubicaciones de destino para seleccionar`, `There are no destination locations to select`), 'dark', 'bottom');
      return;
    }
    
    const locationsTo = this.itemEdit.FromWarehouseCode == this.itemEdit.WarehouseCode ?
                        this.itemEdit.LocationsTo?.filter(location => location.AbsEntry != this.itemEdit?.BinAbsOrigin):
                        this.itemEdit.LocationsTo;

    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData: locationsTo,
          inputTitle: "INVENTORY.SEARCH DESTINATION LOCATION",
          inputFilterProperties: ['BinCode']
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IBinLocation>().then((result) => {
        if(result.data){
          this.itemEdit.BinAbsDestino = result.data?.AbsEntry || 0;
          this.itemForm.controls['BinAbsNameDestino'].patchValue(result.data?.BinCode || '');

          let binLocations = this.itemEdit.StockTransferLinesBinAllocations?.filter(x => x.BinActionType === 'batToWarehouse') || [];

          if (!binLocations || binLocations.length == 0) {
            this.itemEdit.StockTransferLinesBinAllocations.push({
              BinActionType: 'batToWarehouse',
              BinAbsEntry: this.itemEdit.BinAbsDestino,
              Quantity: this.itemEdit.Quantity,
              BaseLineNumber: ((this.itemEdit?.Id || 0) - 1),
              SerialAndBatchNumbersBaseLine: 0
            } as IStockTransferLinesBinAllocations)
          } else {
            this.itemEdit.StockTransferLinesBinAllocations.filter(x => x.BinActionType === 'batToWarehouse').forEach(batToWarehouse=>{
              batToWarehouse.BinAbsEntry= this.itemEdit.BinAbsDestino ?? -1;
            })
          }
        }
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
    }
  }


  /**
   * This method is used to close modal
   * @constructor
   */
  Dismiss() {
    this.modalController.dismiss(this.itemEdit);
  }

  /**
   * This method validate inputs fields
   * @constructor
   */
  ValidateFields() {
    let quantity = +this.itemForm.controls['Quantity'].value;
    if (quantity <= 0) {
      this.commonService.toast(this.commonService.Translate('La cantidad del producto es menor o igual a cero', 'The quantity of the product is less than or equal to zero'), 'dark', 'bottom');
      return;
    }

    if(quantity > +this.itemEdit.Stock){
      this.commonService.toast(this.commonService.Translate('La cantidad no puede ser mayor al stock', 'The quantity cannot be greater than the stock'), 'dark', 'bottom');
      return
    }
    this.itemEdit.Quantity = quantity;
    
    this.itemEdit.StockTransferLinesBinAllocations?.forEach((location)=>{
      location.Quantity = quantity
    })
    this.Dismiss();
  }

  /**
   * This method is used to change data of the form to update models
   * @constructor
   */
  ChangeData(): void {
    let quantity = +this.itemForm.controls['Quantity'].value;
    if(!quantity){
      return
    }
    if(quantity > +this.itemEdit.Stock){
      this.commonService.Alert(AlertType.INFO, 'La cantidad no puede ser mayor al stock', 'The quantity cannot be greater than the stock');
      return
    }
    if (quantity <= 0 ) {
      this.commonService.Alert(AlertType.INFO, 'Cantidad permitida mayor a 0', 'Allowed quantity greater than 0');
      return;
    }
  }

}
