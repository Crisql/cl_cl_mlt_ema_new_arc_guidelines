import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {FormControl, FormGroup} from "@angular/forms";
import {IStockTransferRequestRows} from "../../../../interfaces/i-stock-transfer-request";
import {IWarehouse} from "../../../../models";
import {CustomModalController} from "../../../../services/custom-modal-controller.service";
import {CommonService} from "../../../../services";
import {FilterDataComponent} from "../../../filter-data/filter-data.component";
import {AlertType} from "../../../../common";

@Component({
  selector: 'app-edit-transfer-item',
  templateUrl: './edit-transfer-item.component.html',
  styleUrls: ['./edit-transfer-item.component.scss'],
})
export class EditTransferItemComponent implements OnInit {

  @Input(' item')  item: IStockTransferRequestRows;

  @Input('wareHouse') wareHouse: IWarehouse[];

  itemForm: FormGroup;
  
  itemEdit: IStockTransferRequestRows; 
  constructor(private modalController: ModalController,
              private modalCtrl: CustomModalController,
              private commonService: CommonService) { }

  ngOnInit() {
    this.LoadForm();
    this.itemEdit = this. item;
    this.LoadInitialData();
  }

  LoadForm(): void {
    this.itemForm = new FormGroup({
      ItemCode: new FormControl(''),
      ItemDescription: new FormControl(''),
      Quantity: new FormControl(0),
      FromWarehouseName: new FormControl(''),
      ToWarehouseName: new FormControl(''),
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
      FromWarehouseName: this.GetWarehouseName(this.itemEdit.FromWarehouseCode),
      ToWarehouseName: this.GetWarehouseName(this.itemEdit.WarehouseCode),
    })
  }

  /**
   * Gets the name of the warehouse by code
   * @param _code
   * @constructor
   */
  GetWarehouseName(_code: string): string{
    return this.wareHouse.find(warehouse=> warehouse.WhsCode == _code)?.WhsName || '-'
  }

  /**
   * Opens a modal to select a warehouse destination, then sets the selected destination warehouse.
   */
  async SearchWareHouseDestination() {
    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData: this.wareHouse.filter(wareHouse => wareHouse?.WhsCode != this.itemEdit?.FromWarehouseCode),
          inputTitle: "INVENTORY.SEARCH DESTINATION WAREHOUSE",
          inputFilterProperties: ['WhsName']
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IWarehouse>().then((result) => {
        if(result.data){
          this.itemEdit.WarehouseCode = result?.data?.WhsCode;
          this.itemForm.controls['ToWarehouseName'].patchValue(this.GetWarehouseName(result?.data?.WhsCode))
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
