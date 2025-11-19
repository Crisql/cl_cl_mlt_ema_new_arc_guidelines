import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {CommonService} from "../../../../services";
import {ILocationsModel} from "../../../../models/db/product-model";

@Component({
  selector: 'app-select-batch-location-items',
  templateUrl: './select-batch-location-items.component.html',
  styleUrls: ['./select-batch-location-items.component.scss'],
})
export class SelectBatchLocationItemsComponent implements OnInit {
  @Input("locations") locations: ILocationsModel[];
  @Input("requiredQuantity") requiredQuantity: number;

  searchTerm: string;

  filteredLocations: ILocationsModel[] = [];
  constructor(private modalController: ModalController,
              private commonService: CommonService) { }

  ngOnInit() {}


  /**
   * Validates selected bin allocation quantities, checking for stock limits, non-negative values,
   * and compliance with the required quantity. Displays appropriate messages if validations fail.
   * Closes the modal with the selected locations if all validations pass.
   */
  async ValidateFields(): Promise<void> {

    let binAllocationsSelected: ILocationsModel[] = this.locations.filter((x) => x.Quantity > 0);

    if(binAllocationsSelected.some((x) => x.Quantity > x.Stock)){
      this.commonService.toast(this.commonService.Translate(`La cantidad de unidades seleccionada excede el stock`, `Selected quantity not allowed`), "dark", "bottom");
      return;
    }

    if(binAllocationsSelected.some(x => x.Quantity < 0)){
      this.commonService.toast(this.commonService.Translate(`No se permiten cantidades negativas`, `Negative amounts not allowed`), 'dark', 'bottom');
      return;
    }

    if(binAllocationsSelected.reduce((acc, cur) => acc + cur.Quantity, 0) > this.requiredQuantity){
      this.commonService.toast(this.commonService.Translate(`Cantidad de unidades solicitada excedida`, `Requested amount exceed`), 'dark', 'bottom');
      return;
    }

    this.Dismiss(this.locations);
  }

  /**
   * Closes the modal, passing the selected bin allocations if provided.
   * @param {ILocationsModel[]} [_allocations] - Optional selected locations to return on dismiss.
   */
  Dismiss(_allocations?: ILocationsModel[]) {
    this.modalController.dismiss(_allocations);
  }

  /**
   * Filters locations based on the search term, updating the filtered locations list.
   */
  FilterLocations() {
    this.filteredLocations = this.locations.filter(
        (x) =>
            x.BinCode.toUpperCase().search(this.searchTerm.toUpperCase()) > -1 ||
            x.BinCode.toUpperCase().search(this.searchTerm.toUpperCase()) > -1
    );
  }

  /**
   * Toggles the quantity of the specified bin allocation between 0 and 1.
   * @param {ILocationsModel} _allocation - The bin allocation to update.
   */
  UpdateBinAllocation(_allocation: ILocationsModel) {
    _allocation.Quantity = _allocation.Quantity ? 0 : 1;
  }

  /**
   * Validates and updates the quantity of the specified bin allocation.
   * Ensures the quantity does not exceed available stock or required amount,
   * resetting or adjusting if validation fails.
   * @param {ILocationsModel} _allocation - The bin allocation to validate and update.
   */
  ChangeData(_allocation: ILocationsModel): void {
    if(!_allocation.Quantity){
      return
    }
    if(_allocation.Quantity > _allocation.Stock){
      this.commonService.toast(this.commonService.Translate(`La cantidad no puede ser mayor al disponible`, `The amount cannot be greater than the amount available`), 'dark', 'bottom');
      _allocation.Quantity = 0;
      return;
    }
    if (_allocation.Quantity > this.requiredQuantity ) {
      this.commonService.toast(this.commonService.Translate(`La cantidad no puede ser mayor a la solicitada`, `The amount cannot be greater than that requested`), 'dark', 'bottom');
      return;
    }
  }


}
