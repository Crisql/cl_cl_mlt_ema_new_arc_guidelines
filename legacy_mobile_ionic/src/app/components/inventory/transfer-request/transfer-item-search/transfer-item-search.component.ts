import {Component, Input, OnInit} from '@angular/core';
import {IItemsTransfer} from "../../../../models/db/product-model";
import {CustomModalController} from "../../../../services/custom-modal-controller.service";
import {CommonService} from "../../../../services";
import {AlertType} from "../../../../common";

@Component({
  selector: 'app-transfer-item-search',
  templateUrl: './transfer-item-search.component.html',
  styleUrls: ['./transfer-item-search.component.scss'],
})
export class TransferItemSearchComponent implements  OnInit{

  @Input() inputData: IItemsTransfer[];

  filteredData: IItemsTransfer[];
  
  itemsSelected:  IItemsTransfer[] = [];

  searchTerm: string;
  constructor(private modalController: CustomModalController,
              private commonService: CommonService) { }


  ngOnInit() {
    this.filteredData = this.inputData;
  }

  /**
   * Dismisses the modal and passes the selected items back to the parent component.
   *
   * @param item - An array of items to be passed back upon dismissal. Defaults to null if no items are provided.
   */
  Dismiss(item: IItemsTransfer[] = null)
  {
    this.modalController.dismiss(item);
  }
  
  /**
   * This method retrieves more details of the selected item
   * @param _item The selected item
   * @constructor
   */
  async SelectItem(_item: IItemsTransfer): Promise<void>
  {
    _item.State = !_item.State;
    
    if(_item.State){
      if(+(_item.Stock) == 0){
        this.commonService.Alert(AlertType.INFO, 'El item no posee stock', 'The item is out of stock');
  
        return;
      }
      _item.Quantity = _item.Quantity && _item.Quantity > 0 ? _item.Quantity : 1;
      
      this.itemsSelected.push(_item)

    }
    else
      {
        _item.Quantity = 0;
      
        let i = this.itemsSelected.findIndex(x => x.ItemCode === _item.ItemCode);
        this.itemsSelected.splice(i, 1);
      }
  }

  /**
   * Handles the quantity change for a specific item.
   *
   * @param _qty - The new quantity for the item. If the quantity is not specified or is zero, the function exits.
   * @param _item - The item for which the quantity is being updated.
   */
  public OnQuantityChange(_qty: number, _item: IItemsTransfer): void {
    if(!_qty){
      return
    }
    if(_qty > +_item.Stock){
      this.commonService.Alert(AlertType.INFO, 'La cantidad no puede ser mayor al stock', 'The quantity cannot be greater than the stock');
      return
    }
    if (_qty <= 0 && _item.State) {
      this.commonService.Alert(AlertType.INFO, 'Cantidad permitida mayor a 0', 'Allowed quantity greater than 0');
      return;
    }
    
    let i = this.itemsSelected?.findIndex(x => x.ItemCode === _item.ItemCode);
    if (_qty && this.itemsSelected[i]) {
      this.itemsSelected[i].Quantity = +_qty;
    }
  }

  /**
   * This method is used to save items selected
   * @constructor
   */
  async SaveItemsSelected(): Promise<void> {

    if (!this.itemsSelected || this.itemsSelected.length === 0) {
      this.commonService.toast(this.commonService.Translate(`Seleccione un producto al menos, por favor`, `Choose an item at least please`), 'dark', 'bottom');
      return;
    }

    if (this.itemsSelected.some(p => !p.Quantity)) {
      await this.commonService.toast(this.commonService.Translate('Hay al menos un producto con cantidad menor o igual a cero', 'There is at least one product with quantity less than or equal to zero'), 'dark', 'bottom');
      return;
    }

    if (this.itemsSelected.some(p => p.Quantity > +p.Stock)) {
      await this.commonService.toast(this.commonService.Translate('Hay al menos un producto con cantidad mayor al stock', 'There is at least one product with a quantity greater than the stock'), 'dark', 'bottom');
      return;
    }

    await this.Dismiss(this.itemsSelected);
  }

  /**
   * This method is used to filter products
   * @constructor
   */
  FilterProducts(): void {
    this.filteredData = this.inputData
        .filter(
            (x) =>
                x.ItemCode?.toUpperCase()?.search(this.searchTerm?.toUpperCase()) > -1 ||
                x.ItemName?.toUpperCase()?.search(this.searchTerm?.toUpperCase()) > -1
        );
  }

}
